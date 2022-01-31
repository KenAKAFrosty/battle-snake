const { 
    getEmptyBoardMap, 
    getBoardMapWithOutOfBoundsApplied, 
    getBoardMapWithSnakeOccupantsApplied, 
    getBoardMapWithSnakeValueScoresApplied 
} = require('./logic/boardMapping.js');

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
    let boardMap = getEmptyBoardMap(gameState.board.height);
    boardMap = getBoardMapWithOutOfBoundsApplied(boardMap, -15);
    boardMap = getBoardMapWithSnakeOccupantsApplied(boardMap, gameState.board.snakes);
    boardMap = getBoardMapWithSnakeValueScoresApplied(boardMap);
    const move = getMove(boardMap, gameState.you.head);
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
