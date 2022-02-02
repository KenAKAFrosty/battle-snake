const { getSurvivalDirections } = require("./turnSimulation.js");


function getMove(gameState){ 
    const survivalDirections = getSurvivalDirections(gameState);
    console.log(survivalDirections);
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
    getCoordinateStringOfDirectionFromCoordinateObject,
    getValueScoresOfAllDirectionsFrom,
    getDirectionWithLargestValueScore
}