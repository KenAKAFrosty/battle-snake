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
    getIdsOfSnakesWhoAteThisRound
}