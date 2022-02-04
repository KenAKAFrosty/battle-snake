const { getGameStateWithTurnSimulation } = require("./turnSimulation.js");
const directions = ["up","down","left","right"]

async function getMove(gameState){ 
    gameState = await getGameStateWithTurnSimulation(gameState);
    const directionOutcomes = gameState.outcomes; 
    const prioritizeEatingButAvoidOverfeeding = {}
    for (const direction in directionOutcomes) {
        prioritizeEatingButAvoidOverfeeding[direction] = directionOutcomes[direction].filter(e=> !e.overfed && e.ateFood)
    }
    const feedButAvoidOverfeedingDirections = getDirectionValuesFromOutcomes(prioritizeEatingButAvoidOverfeeding);
    const bestFedButNotOverfedChoice = getBestChoiceFromDirectionValues(feedButAvoidOverfeedingDirections);
    console.log(feedButAvoidOverfeedingDirections)
    if (bestFedButNotOverfedChoice) { return bestFedButNotOverfedChoice }

    const justAvoidOverfeeding = {}
    for (const direction in directionOutcomes) {
        justAvoidOverfeeding[direction] = directionOutcomes[direction].filter(e=> !e.overfed)
    }
    const justAvoidOverfeedingDirections = getDirectionValuesFromOutcomes(justAvoidOverfeeding);
    const bestNotOverfedChoice = getBestChoiceFromDirectionValues(justAvoidOverfeedingDirections);
    console.log(justAvoidOverfeedingDirections);
    if (bestNotOverfedChoice) { return bestNotOverfedChoice }

    const survivalDirections = getDirectionValuesFromOutcomes(directionOutcomes);
    const bestSurvivalChoice = getBestChoiceFromDirectionValues(survivalDirections);
    console.log(survivalDirections)
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

function snakesAreEqual(snake1,snake2){ 
    if (snake1.body.length !== snake2.body.length) { return false };
    for (let i = 0; i < snake1.body.length; i++){ 
        if (snake1.body[i].x != snake2.body[i].x ||
            snake1.body[i].y != snake2.body[i].y) { return false };
    }
    return true; 
}

module.exports = { 
    getMove,
    getIdsOfSnakesWhoAteThisRound,
    getDirectionValuesFromOutcomes,
    getBestChoiceFromDirectionValues,
    snakesAreEqual
}