const { getSurvivalDirections } = require("./turnSimulation.js");


function getMove(gameState){ 
    const survivalDirections = getSurvivalDirections(gameState);
    let choice = "";
    let maxValue = 0
    for (key in survivalDirections){ 
        const value = survivalDirections[key];
        if (value > choice.maxValue) { 
            maxValue = choice;
            choice = key;
        }
    }
    return key;
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