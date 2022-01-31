
function getMove(boardMap, myHead){ 
    const valueScores = getValueScoresOfAllDirectionsFrom(myHead, boardMap);
    const directionToMove = getDirectionWithLargestValueScore(valueScores);
    return directionToMove;
}

function getValueScoresOfAllDirectionsFrom(coordinateObject, boardMap){ 
    const allDirections =  { 
        "up":0,
        "down":0,
        "right":0,
        "left":0
    }
    for (direction in allDirections){ 
        const coordinateString = getCoordinateStringOfDirectionFromCoordinateObject(direction, coordinateObject);
        const valueScore = boardMap[coordinateString].valueScore;
        allDirections[direction] = valueScore;
    }
    return allDirections
}


function getCoordinateStringOfDirectionFromCoordinateObject(direction, coordinateObject) { 
    return { 
        "up":function(){
            return coordinateObject.x + "," + (coordinateObject.y+1)
        },
        "down":function(){
            return coordinateObject.x + "," + (coordinateObject.y-1)
        },
        "right":function(){
            return (coordinateObject.x + 1) + "," + coordinateObject.y
        },
        "left":function(){
            return (coordinateObject.x - 1) + "," + coordinateObject.y
        },
    } [direction]()
}


function getDirectionWithLargestValueScore(valueScores){ 
    const max = Math.max(...Object.values(valueScores));
    for (direction in valueScores){ 
        if (valueScores[direction] === max){ 
            return direction;
        }
    }
    return null;
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
    getCoordinateStringOfDirectionFromCoordinateObject,
    getValueScoresOfAllDirectionsFrom,
    getDirectionWithLargestValueScore
}