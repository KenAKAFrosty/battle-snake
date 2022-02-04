
const { getMove, getIdsOfSnakesWhoAteThisRound, getDirectionFacing } = require('./logic/moveLogic.js');
function info() {
    console.log("INFO")
    const response = {
        apiversion: "1",
        author: "",
        color: "#0099ff",
        head: "silly",
        tail: "coffee"
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

async function move(gameState) {
    gameState.ateLastRound = ateLastRound;
    if (gameState.board.snakes.length === 1) gameState.overfeedTolerance = 5
    else {
            gameState.overfeedTolerance = 105
        }
    };
    const move = await getMove(gameState);
    const response = {
        move
    }
    ateLastRound = {};
    const ids = getIdsOfSnakesWhoAteThisRound(gameState);
    for (const id of ids) {
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

