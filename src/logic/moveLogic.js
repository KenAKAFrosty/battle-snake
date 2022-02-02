const { getGameStateWithTurnSimulation } = require("./turnSimulation.js");
const directions = ["up","down","left","right"]

function getMove(gameState){ 
    gameState = getGameStateWithTurnSimulation(gameState);
    const allOutcomes = gameState.outcomes; 

    const avoidOverfeeding = allOutcomes.filter(e=> !e.overfed);
    const avoidOverfeedingDirections = getDirectionValuesFromOutcomes(avoidOverfeeding);
    const bestNotOverfedChoice = getBestChoiceFromDirectionValues(avoidOverfeedingDirections);
    console.log(avoidOverfeedingDirections)
    if (bestNotOverfedChoice) { return bestNotOverfedChoice }

    const survivalDirections = getDirectionValuesFromOutcomes(allOutcomes);
    const bestSurvivalChoice = getBestChoiceFromDirectionValues(survivalDirections);
    console.log(survivalDirections);
    return bestSurvivalChoice;
}

function getIdsOfSnakesWhoAteThisRound(gameState){ 
    const ids = [];
    for (const snake of gameState.board.snakes){ 
        const head = snake.body[0];
        for (const piece of gameState.board.food){ 
            if (head.x === piece.x && head.y === piece.y){ 
                ids.push(snake.id)
            }
        }
    }
    return ids;
}


function getDirectionValuesFromOutcomes(outcomes){ 
    const directionValues = {};
    for (const direction of directions) {
        directionValues[direction] = outcomes.filter(e => e.snake.originalDirection === direction).length
    }
    return directionValues;
}

function getBestChoiceFromDirectionValues(directionValues){ 
    let choice = "";
    let maxValue = 0
    for (const direction in directionValues){ 
        const value = directionValues[direction];
        if (value > maxValue) { 
            maxValue = value;
            choice = direction;
        }
    }
    if (maxValue === 0){ return false }
    else {return choice}
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
    getIdsOfSnakesWhoAteThisRound,
    getDirectionValuesFromOutcomes,
    getBestChoiceFromDirectionValues
}