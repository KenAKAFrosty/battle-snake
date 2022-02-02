
const { getMove, getIdsOfSnakesWhoAteThisRound } = require('./logic/moveLogic.js');

function info() {
    console.log("INFO")
    const response = {
        apiversion: "1",
        author: "",
        color: "#888888",
        head: "default",
        tail: "default"
    }
    return response
}


let ateLastRound = {};
function start(gameState) {
    ateLastRound = {};
    console.log(`${gameState.game.id} START`)
}

function end(gameState) {
    console.log(`${gameState.game.id} END\n`)
}

function move(gameState) {
    gameState.ateLastRound = ateLastRound;
    gameState.overfeedTolerance = 5;
    const move = getMove(gameState);
    const response = { 
        move
    }
    ateLastRound = {};
    const ids = getIdsOfSnakesWhoAteThisRound(gameState);
    for (const id of ids){ 
        ateLastRound[id] = true;
    }
    console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
    return response
}

module.exports = {
    info: info,
    start: start,
    move: move,
    end: end
}

