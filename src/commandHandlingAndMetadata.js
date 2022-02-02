
const { getMove } = require('./logic/moveLogic.js');

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

function start(gameState) {
    console.log(`${gameState.game.id} START`)
}

function end(gameState) {
    console.log(`${gameState.game.id} END\n`)
}

function move(gameState) {

    const move = getMove(gameState);
    const response = { 
        move
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

