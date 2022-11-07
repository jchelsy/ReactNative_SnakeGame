import Constants from '../Constants';

const randomPositions = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};


export default function (entities, { events, dispatch }) {
  const head = entities.head;
  const food = entities.food;
  const tail = entities.tail;

  if (events.length) {
    events.forEach((e) => {
      switch (e) {
        // UP MOVEMENT
        case "move-up":
          if (head.yspeed === 1) return;
          head.yspeed = -1;
          head.xspeed = 0;
          return;
        // RIGHT MOVEMENT
        case "move-right":
          if (head.xspeed === -1) return;
          head.xspeed = 1;
          head.yspeed = 0;
          return;
        // DOWN MOVEMENT
        case "move-down":
          if (head.yspeed === -1) return;
          head.yspeed = 1;
          head.xspeed = 0;
          return;
        // LEFT MOVEMENT
        case "move-left":
          if (head.xspeed === 1) return;
          head.xspeed = -1;
          head.yspeed = 0;
          return;
      }
    });
  }

  head.nextMove -= 1;
  
  // Snake Head updating - If the head reaches a border, then "Game Over!"
  if (head.nextMove === 0) {
    head.nextMove = head.updateFrequency;

    if (
      head.position[0] + head.xspeed < 0 ||
      head.position[0] + head.xspeed >= Constants.GRID_SIZE ||
      head.position[1] + head.yspeed < 0 ||
      head.position[1] + head.yspeed >= Constants.GRID_SIZE
    ) {
      dispatch("game-over");
    } else {
      // Add new tail piece to the snake
      tail.elements = [[head.position[0], head.position[1]], ...tail.elements];
      tail.elements.pop();
      
      head.position[0] += head.xspeed;
      head.position[1] += head.yspeed;

      tail.elements.forEach((el, idx) => {
        console.log({ el, idx });
        if (
          head.position[0] === el[0] &&
          head.position[1] === el[1]
        )
          dispatch("game-over");
      });

      if (
        head.position[0] === food.position[0] &&
        head.position[1] === food.position[1]
      ) {
        tail.elements = [
          [head.position[0], head.position[1]],
          ...tail.elements,
        ];

        food.position = [
          randomPositions(0, Constants.GRID_SIZE - 1),
          randomPositions(0, Constants.GRID_SIZE - 1),
        ];
      }
    }
  }

  return entities;
}