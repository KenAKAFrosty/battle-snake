function getEmptyBoardMap(size) {
    if (size < 2) return null;
    const boardMap = {}
    for (let x = -1; x <= size; x++) {
        for (let y = -1; y <= size; y++) {
            const coordinateString = x.toString() + "," + y.toString();
            boardMap[coordinateString] = { occupant: { type: "empty" }, valueScore: 0 }
        }
    }
    boardMap.size = size;
    return boardMap;
}

function getBoardMapWithOutOfBoundsApplied(boardMap, valueScore) {
    if (!boardMap) return null;
    if (!boardMap.size) return null;
    if (typeof valueScore != "number") return null;
    for (let i = -1; i <= boardMap.size; i++) {
        boardMap[`-1,${i}`].occupant = { type: "outOfBounds" };
        boardMap[`-1,${i}`].valueScore = valueScore;

        boardMap[`${i},-1`].occupant = { type: "outOfBounds" };
        boardMap[`${i},-1`].valueScore = valueScore;

        boardMap[`${boardMap.size},${i}`].occupant = { type: "outOfBounds" };
        boardMap[`${boardMap.size},${i}`].valueScore = valueScore;

        boardMap[`${i},${boardMap.size}`].occupant = { type: "outOfBounds" };
        boardMap[`${i},${boardMap.size}`].valueScore = valueScore;
    }
    return boardMap;
}


function getBoardMapWithSnakeOccupantsApplied(boardMap, snakes) {
    if (!boardMap || !snakes) return null;
    for (const snake of snakes) {
        for (const bodyIndex in snake.body) {
            const part = snake.body[bodyIndex];
            const occupant = {
                type: "snake",
                name: snake.name,
                id: snake.id,
                squad: snake.squad,
                health: snake.health,
                bodyIndex: Number(bodyIndex),
                bodyLength: snake.body.length
            }
            const coordinateString = part.x.toString() + "," + part.y.toString();
            boardMap[coordinateString].occupant = occupant;
        }
    }
    return boardMap;
}


function getBoardMapWithSnakeValueScoresApplied(boardMap) {
    if (!boardMap) return null;
    for (let x = -1; x <= boardMap.size; x++) {
        for (let y = -1; y <= boardMap.size; y++) {
            const coordinateString = x.toString() + "," + y.toString();
            const tile = boardMap[coordinateString];
            if (tile.occupant.type !== "snake") { continue };
            tile.valueScore += getBasicSnakeBodyPartValueScores(tile.occupant);
        }
    }
    return boardMap;
}


function getBasicSnakeBodyPartValueScores(occupant) {
    if (occupant.type !== "snake") return null;
    let whichPart = "other";
    if (occupant.bodyIndex === 0) { whichPart = "head" };
    if (occupant.bodyIndex === occupant.bodyLength - 1) { whichPart = "tail" };
    return {
        "head": -15,
        "tail": -15,
        "other": -15
    }[whichPart]
}

function getBoardMapWithFoodApplied(boardMap, food) {
    for (const piece of food) {
        const coordinateString = piece.x + "," + piece.y;
        boardMap[coordinateString] = {
            occupant: {
                type: "food",
            },
            valueScore: 1
        }
        applyValueScoreInRingAroundCoordinates(boardMap, piece, 1)
    }
    return boardMap;
}

function applyValueScoreInRingAroundCoordinates(boardMap, coordinateObject, valueScore) {
    const coordinateStrings = [];
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0){ continue }
            const string = (coordinateObject.x+x) +","+ (coordinateObject.y+y);
            coordinateStrings.push(string)
        }
    }
    for (location of coordinateStrings) {
        boardMap[location].valueScore += valueScore;
    }
}

function getBoardMapWithHealthierEnemiesWeightedNegative(boardMap, snakes, mySnake){ 
    if (!boardMap || !mySnake) return null;
    for (const snake of snakes){ 
        if (snake.id === mySnake.id) { continue };
        if (snake.health < mySnake.health) { continue }
        for (const part of snake.body){ 
            applyValueScoreInRingAroundCoordinates(boardMap,part,-1.5)
        }
    }
    return boardMap
}

function applyNegativeValueScoreToCurledEmptySpace(boardMap, myBody){ 
    for (part of myBody) {
        checkRowForEmptyCurledSpace(part,myBody, boardMap)
        checkColumnForEmptyCurledSpace(part,myBody, boardMap);
    }
    return boardMap;
}

function checkColumnForEmptyCurledSpace(coords, allCoords, boardMap){ 
    const x = coords.x;
    const thisColumn = allCoords.filter(e=>e.x === x);
    
    for (let i = 1; i < thisColumn.length; i++){ 
        const distanceFromPrevious = Math.abs( thisColumn[i].y - thisColumn[i-1].y ); 
        if(distanceFromPrevious > 1 ) { 
            applyScoreToTilesBetweenColumn( thisColumn[i], thisColumn[i-1], boardMap, 2.5)
        }
    }
}

function checkRowForEmptyCurledSpace(coords, allCoords, boardMap){ 
    const y = coords.y;
    const thisColumn = allCoords.filter(e=>e.y === y);
    
    for (let i = 1; i < thisColumn.length; i++){ 
        const distanceFromPrevious = Math.abs( thisColumn[i].x - thisColumn[i-1].x); 
        if(distanceFromPrevious > 1 ) { 
            applyScoreToTilesBetweenRow( thisColumn[i], thisColumn[i-1], boardMap, 2.5)
        }
    }
}


function applyScoreToTilesBetweenColumn(tile1,tile2, boardMap, value){ 
    if (tile1.x !== tile2.x) return null;
    const x = tile1.x;
    const smallerY = Math.min(tile1.y, tile2.y); 
    const largerY = Math.max(tile1.y, tile2.y);

    for (let i = smallerY+1; i < largerY; i ++ ){ 
        boardMap[x+","+i].valueScore -= value
    }
}



function applyScoreToTilesBetweenRow(tile1,tile2, boardMap, value){ 
    if (tile1.y !== tile2.y) return null;
    const y = tile1.y;
    const smallerX = Math.min(tile1.x, tile2.x); 
    const largerX = Math.max(tile1.x, tile2.x);

    for (let i = smallerX+1; i < largerX; i ++ ){ 
        boardMap[i+","+y].valueScore -= value
    }
}



module.exports = {
    getEmptyBoardMap,
    getBoardMapWithOutOfBoundsApplied,
    getBoardMapWithSnakeOccupantsApplied,
    getBoardMapWithSnakeValueScoresApplied,
    getBoardMapWithFoodApplied,
    applyValueScoreInRingAroundCoordinates,
    getBoardMapWithHealthierEnemiesWeightedNegative,
    applyNegativeValueScoreToCurledEmptySpace
}