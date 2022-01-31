function getEmptyBoardMap(size){ 
    if (size < 2) return null;
    const boardMap = {}
    for (let x = -1; x <= size; x++){ 
        for (let y = -1; y <= size; y++){ 
            const coordinateString = x.toString() +","+ y.toString();
            boardMap[coordinateString] = {occupant:{type:"empty"},valueScore:0}
        }
    }
    boardMap.size = size;
    return boardMap;
}

function getBoardMapWithOutOfBoundsApplied(boardMap, valueScore){ 
    if (!boardMap) return null;
    if (!boardMap.size) return null;
    if (typeof valueScore != "number") return null;
    for (let i=-1; i <= boardMap.size; i ++){ 
        boardMap[`-1,${i}`].occupant = {type:"outOfBounds"};
        boardMap[`-1,${i}`].valueScore = valueScore;

        boardMap[`${i},-1`].occupant = {type:"outOfBounds"};
        boardMap[`${i},-1`].valueScore = valueScore;


        boardMap[`${boardMap.size},${i}`].occupant = {type:"outOfBounds"};
        boardMap[`${boardMap.size},${i}`].valueScore = valueScore;

        boardMap[`${i},${boardMap.size}`].occupant = {type:"outOfBounds"};
        boardMap[`${i},${boardMap.size}`].valueScore = valueScore;
    }
    return boardMap;
}


function getBoardMapWithSnakeOccupantsApplied(boardMap,snakes){ 
    if (!boardMap || !snakes) return null;
    for (const snake of snakes){ 
        for (const bodyIndex in snake.body){ 
            const part = snake.body[bodyIndex];
            const occupant = { 
                type:"snake",
                name:snake.name,
                id:snake.id,
                squad:snake.squad,
                health:snake.health,
                bodyIndex:Number(bodyIndex),
                length:snake.body.length
            }
            const coordinateString = part.x.toString() + "," + part.y.toString();
            boardMap[coordinateString].occupant = occupant;
        }
    }
    return boardMap;
}

function getBoardMapWithSnakeValueScoresApplied(boardMap){ 
    return boardMap;
}

module.exports = {
    getEmptyBoardMap,
    getBoardMapWithOutOfBoundsApplied,
    getBoardMapWithSnakeOccupantsApplied
}