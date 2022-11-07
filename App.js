import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Food from './src/components/Food';
import Head from './src/components/Head';
import Tail from './src/components/Tail';

import Constants from './src/Constants';
import GameLoop from './src/systems/GameLoop';

import { Accelerometer } from 'expo-sensors';


export default function App() {
  // Constant of the board's pixel length (grid size --> pixel size)
  const BoardSize = Constants.GRID_SIZE * Constants.CELL_SIZE;
  
  // Game Engine
  const engine = useRef(null);

  // State variable for when the game is running (False = game over)
  const [isGameRunning, setIsGameRunning] = useState(true);

  // Method to generate random positions (for food)
  const randomPositions = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  // Method to reset all game components (for new game)
  const resetGame = () => {
    engine.current.swap({
      head: {
        position: [0, 0],
        size: Constants.CELL_SIZE,
        updateFrequency: 10,
        nextMove: 10,
        xspeed: 0,
        yspeed: 0,
        renderer: <Head />,
      },
      food: {
        position: [
          randomPositions(0, Constants.GRID_SIZE - 1),
          randomPositions(0, Constants.GRID_SIZE - 1),
        ],
        size: Constants.CELL_SIZE,
        updateFrequency: 10,
        nextMove: 10,
        xspeed: 0,
        yspeed: 0,
        renderer: <Food />,
      },
      tail: {
        size: Constants.CELL_SIZE,
        elements: [],
        renderer: <Tail />,
      },
    });
    setIsGameRunning(true);
  };

  // Accelerometer Configuration
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);
  
  const _interval = () => {
    Accelerometer.setUpdateInterval(100);
  };

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
      })
    );
  };
  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };
  
  useEffect(() => {
    _interval();
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const { x, y, z } = data;

  // console.log(round(x), round(y), round(z));
  
  // Accelerometer values controlling movement
  if (x >= 0.3) engine.current.dispatch("move-left");
  if (x <= -0.3) engine.current.dispatch("move-right");
  if (z < -0.5 && y < 1) engine.current.dispatch("move-down");
  if (z > 1 && y < -0.2) engine.current.dispatch("move-up");

  // What is printed (returned) to the screen
  return (
    <View style={styles.canvas}>
      <GameEngine
        ref={engine}
        style={{
          width: BoardSize,
          height: BoardSize,
          flex: null,
          backgroundColor: "white",
        }}
        entities={{
          head: {
            position: [0, 0],
            size: Constants.CELL_SIZE,
            updateFrequency: 10,
            nextMove: 10,
            xspeed: 0,
            yspeed: 0,
            renderer: <Head />,
          },
          food: {
            position: [
              randomPositions(0, Constants.GRID_SIZE - 1),
              randomPositions(0, Constants.GRID_SIZE - 1),
            ],
            size: Constants.CELL_SIZE,
            renderer: <Food />,
          },
          tail: {
            size: Constants.CELL_SIZE,
            elements: [],
            renderer: <Tail />,
          },
        }}
        systems={[GameLoop]}
        running={isGameRunning}
        onEvent={(e) => {
          switch (e) {
            case "game-over":
              alert("Game Over!");
              setIsGameRunning(false);
              return;
          }
        }}
      />
      <View style={styles.controlContainer}>
        {/*UP ARROW*/}
        <View style={styles.controllerRow}>
          <TouchableOpacity onPress={() => engine.current.dispatch("move-up")}>
            <View style={styles.controlBtn}>
              <Icon name="arrow-up-bold-circle" size={100} color="#BBBBBB" />
            </View>
          </TouchableOpacity>
        </View>

        {/*LEFT & RIGHT ARROWS*/}
        <View style={styles.controllerRow}>
          {/*LEFT ARROW*/}
          <TouchableOpacity onPress={() => engine.current.dispatch("move-left")}>
            <View style={styles.controlBtn}>
              <Icon name="arrow-left-bold-circle" size={100} color="#BBBBBB" />
            </View>
          </TouchableOpacity>

          {/*BLANK SPACE*/}
          <View style={[styles.controlBtn, { backgroundColor: null }]} />

          {/*RIGHT ARROW*/}
          <TouchableOpacity onPress={() => engine.current.dispatch("move-right")}>
            <View style={styles.controlBtn}>
              <Icon name="arrow-right-bold-circle" size={100} color="#BBBBBB" />
            </View>
          </TouchableOpacity>
        </View>

        {/*DOWN ARROW*/}
        <View style={styles.controllerRow}>
          <TouchableOpacity onPress={() => engine.current.dispatch("move-down")}>
            <View style={styles.controlBtn}>
              <Icon name="arrow-down-bold-circle" size={100} color="#BBBBBB" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{position: "absolute", bottom: "2.5%"}}>
        {!isGameRunning && (
          <TouchableOpacity onPress={resetGame}>
            <Text style={{
              color: "white",
              marginTop: 15,
              fontSize: 22,
              padding: 10,
              backgroundColor: "grey",
              borderRadius: 10,
            }}>Start New Game</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Function to round Accelerometer values
function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

// Screen styles
const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  controlContainer: {
    marginTop: 40,
  },
  controllerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlBtn: {
    backgroundColor: "#AAAAAA",
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});