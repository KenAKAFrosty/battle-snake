const { getGameStateWithTurnSimulation } = require("./turnSimulation.js");


function getMove(gameState){ 
    const updatedGameState = getGameStateWithTurnSimulation(gameState);
    const survivalDirections = updatedGameState.survivalDirections;
    console.log(survivalDirections);
    let choice = "";
    let maxValue = 0
    for (const direction in survivalDirections){ 
        const value = survivalDirections[direction];
        if (value > maxValue) { 
            maxValue = value;
            choice = direction;
        }
    }
    return choice;
}



function getDirectionFacing(snake){ 
    const head = snake.body[0];
    const neck = snake.body[1]
    if (neck.x < head.x) {
       return "right"
    } else if (neck.x > head.x) {
        return "left"
    } else if (neck.y < head.y) {
        return "up"
    } else if (neck.y > head.y) {
        return "down"
    }
}


function getOppositeDirection(direction){
    return {
        "right":"left",
        "left":"right",
        "up":"down",
        "down":"up"
    }[direction]
}


module.exports = { 
    getMove,
}