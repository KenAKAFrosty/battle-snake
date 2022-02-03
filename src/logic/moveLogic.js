const { getGameStateWithTurnSimulation } = require("./turnSimulation.js");
const directions = ["up","down","left","right"]

function getMove(gameState){ 
    gameState = getGameStateWithTurnSimulation(gameState);
    const directionOutcomes = gameState.outcomes; 
    
    const prioritizeEatingButAvoidOverfeeding = {}
    for (const direction in directionOutcomes) {
        prioritizeEatingButAvoidOverfeeding[direction] = directionOutcomes[direction].filter(e=> !e.overfed && e.ateFood)
    }
    const avoidOverfeedingDirections = getDirectionValuesFromOutcomes(prioritizeEatingButAvoidOverfeeding);
    const bestNotOverfedChoice = getBestChoiceFromDirectionValues(avoidOverfeedingDirections);
    if (bestNotOverfedChoice) { return bestNotOverfedChoice }

    const survivalDirections = getDirectionValuesFromOutcomes(directionOutcomes);
    const bestSurvivalChoice = getBestChoiceFromDirectionValues(survivalDirections);
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
    let values = {}
    for (const direction in outcomes){ 
        values[direction] = outcomes[direction].length;
    }
    return values;
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

module.exports = { 
    getMove,
    getIdsOfSnakesWhoAteThisRound,
    getDirectionValuesFromOutcomes,
    getBestChoiceFromDirectionValues,
}