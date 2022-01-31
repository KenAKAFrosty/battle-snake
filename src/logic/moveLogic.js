
function getMove(gameState){ 
    let possibleMoves = {
        up: true,
        down: true,
        left: true,
        right: true
    }
    const myDirectionFacing = getDirectionFacing(gameState.you);
    const backwardsForMe = getOppositeDirection(myDirectionFacing);
    possibleMoves[backwardsForMe] = false;

    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])
    const move = safeMoves[Math.floor(Math.random() * safeMoves.length)]
    return move;
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
    getMove
}