const directions = ["up", "down", "left", "right"]
const defaultNumberOfTurnsToLookAhead = 8;

async function getGameStateWithTurnSimulation(gameState, turnsToLookAhead) {
    turnsToLookAhead = turnsToLookAhead || defaultNumberOfTurnsToLookAhead
    gameState.you.turns = 0;
    gameState = await getBreadthFirstOutcomesForAllDirectionsAfterNTurns(turnsToLookAhead, gameState);
    return gameState;
}

async function getBreadthFirstOutcomesForAllDirectionsAfterNTurns(turnsToLookAhead, gameState) {
    const initial = { snake: gameState.you, ateLastRound: gameState.ateLastRound }
    const backwards = backwardsDirection(initial.snake);

    //initial setup for each original direction taken
    let directionOutcomes = await getInitialDirectionOutcomes(backwards, initial, gameState);

    for (let turn = 1; turn < turnsToLookAhead; turn++) { //remove this for depth first
        const promises = [];
        for (const direction of directions) {
            if (!directionOutcomes[direction]) { continue }
            let outcomes = directionOutcomes[direction];
            const startingLength = outcomes.length;

            for (outcomes.i; outcomes.i < startingLength; outcomes.i++) { //swap out startingLength for outcomes.length for depth-first
                //if (snake.turns >= turnsToLookAhead){break} <---- this is used for depth-first
                const thisSnake = outcomes[outcomes.i].snake;
                const backwards = backwardsDirection(thisSnake);

               const closestWallDirection = getClosestWallDirection(backwards, thisSnake, gameState); //not using this pruning currently

                for (const directionToSimulate of directions) {
                    if (directionToSimulate === backwards) { continue };
                    outcomePromise = processTurn(directionToSimulate, outcomes, outcomes.i, gameState);
                    promises.push[outcomePromise]
                }
                delete outcomes[outcomes.i]
            }
        }

        for (const promise of promises) {
            const [directionUsed, outcome] = await promise;
            directionOutcomes[directionUsed] = outcome;
        }
    } //remove this for depth first
    for (key in directionOutcomes) {
        directionOutcomes[key] = directionOutcomes[key].filter(e => e.snake.turns === turnsToLookAhead);
    }

    gameState.outcomes = directionOutcomes
    return gameState;
}

function getClosestWallDirection(backwards, thisSnake, gameState) {
    const distancesToWalls = [];
    for (const wallDirection of directions) {
        if (wallDirection != backwards) {
            distancesToWalls.push({
                direction: wallDirection,
                distance: getDistanceFromWall(thisSnake.body[0], wallDirection, gameState.board.height)
            });
        }
    }
    distancesToWalls.sort((a, b) => a.distance - b.distance);
    let closestWallDirection = "";
    if (distancesToWalls[0].distance != distancesToWalls[1].distance) {
        closestWallDirection = distancesToWalls[0].direction;
    }
    return closestWallDirection
}

function getDistanceFromWall(coordsObj, direction, boardSize){ 

    return { 
        "up":function(){return (boardSize-1) - coordsObj.y},
        "down":function(){return coordsObj.y},
        "right":function(){return (boardSize-1) - coordsObj.x},
        "left":function(){return coordsObj.x},
    }[direction]()
}

async function getInitialDirectionOutcomes(backwards, initial, gameState) {
    let directionOutcomes = {};
    for (const direction of directions) {
        if (direction !== backwards) {
            directionOutcomes[direction] = [initial];
            const [, outcomes] = await processTurn(direction, directionOutcomes[direction], 0, gameState);
            directionOutcomes[direction] = outcomes;
            directionOutcomes[direction]["i"] = 0;
            directionOutcomes[direction].shift(); //the 0 element is still the current-state copy, we want that out now
        }
    }
    return directionOutcomes;
}

function processTurn(direction, outcomes, i, gameState) {
    const snake = outcomes[i].snake;
    let ateLastRound = outcomes[i].ateLastRound;
    let overfed = outcomes[i].overfed;
    let ateFood = outcomes[i].ateFood;
    let struck = outcomes[i].struck;
    const copy = JSON.parse(JSON.stringify(snake));
    copy.health--
    moveSnake(copy, direction, ateLastRound)
    copy.turns++
    ateLastRound = {};
    const foundFood = didFindFood(copy, gameState.board.food)
    if (foundFood) {
        copy.health += 100
        ateLastRound[copy.id] = true;
        overfed = isOverfed(copy, gameState.overfeedTolerance);
        ateFood = true;
    } else {
        if (ateLastRound[copy.id]) delete ateLastRound[copy.id]
    }
    const [ threatZones,strikeZones ] = getEnemyThreatAndStrikeZones(snake,gameState.board.snakes);
    if (didEnterZone(copy, strikeZones)) {
        struck = true;
    }
    const died = didSnakeDie(copy, gameState, threatZones);
    if (!died) {
        if (copy.health > 99) { copy.health = 99 }
        outcomes.push({ snake: copy, ateLastRound, overfed, ateFood, struck });
    }
    return new Promise(resolve => resolve([direction, outcomes]));
}


function didSnakeDie(copy, gameState, threatZones) {
    const snakeCollided = isCollidedWithBodyPart(copy, gameState.board.snakes);
    const boardCollided = isCollidedWithBoundary(copy, gameState.board.width);
    const outOfHealth = isOutOfHealth(copy);
    const threatened = didEnterZone(copy, threatZones)
    return snakeCollided || boardCollided || outOfHealth || threatened
}

function didEnterZone(snake, threatZones){ 
    for (const spot of threatZones){ 
        if (spot.x === snake.body[0].x && spot.y === snake.body[0].y){ 
            return true
        }
    }
    return false;
}

function backwardsDirection(snake) {
    const directionFacing = getDirectionFacing(snake);
    const oppositeDirection = getOppositeDirection(directionFacing);
    return oppositeDirection;
}

function getDirectionFacing(snake) {
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


function getOppositeDirection(direction) {
    return {
        "right": "left",
        "left": "right",
        "up": "down",
        "down": "up"
    }[direction]
}



function moveSnake(snake, direction, ateLastRound = {}) {
    moveBody(snake, ateLastRound)
    moveHead(snake.body[0], direction)
    // if (!snake["originalDirection"]) snake["originalDirection"] = direction;
}

function moveHead(head, direction) {
    const directionDict = {
        "up": function () { head.y += 1 },
        "down": function () { head.y -= 1 },
        "left": function () { head.x -= 1 },
        "right": function () { head.x += 1 },
    }
    directionDict[direction]();
}

function moveBody(snake, ateLastRound) {
    const body = snake.body
    const preMoveTail = {
        x: body[body.length - 1].x,
        y: body[body.length - 1].y
    }
    for (let i = body.length - 1; i >= 1; i--) {  //ignore head, stop at 1 not 0
        body[i].x = body[i - 1].x;
        body[i].y = body[i - 1].y;
    }
    if (ateLastRound[snake.id]) {
        body.push(preMoveTail);
    }
}

function didFindFood(theSnake, food) {
    for (const piece of food) {
        if (piece.x === theSnake.body[0].x && piece.y === theSnake.body[0].y) {
            return true;
        }
    }
    return false;
}

function isCollidedWithBodyPart(theSnake, allSnakes) {
    for (const snake of allSnakes) {
        const tail = snake.body[snake.body.length-1]
        const head = snake.body[0];
        for (const part of snake.body) {
            const isSelf = (theSnake.id === allSnakes.id);
            const partIsTail = ( part.x === tail.x ) && ( part.y === tail.y )  
            const partIsHead = ( part.x === head.x ) && ( part.y === head.y )
            if (isSelf) if (partIsTail || partIsHead) { continue }

            if (theSnake.body[0].x === part.x && theSnake.body[0].y === part.y) {
                return true;
            }
        }
    }
    return false;
}

function isCollidedWithBoundary(theSnake, boardSize) {
    const head = theSnake.body[0];
    if (head.x < 0 || head.y < 0 || head.x >= boardSize || head.y >= boardSize) {
        return true;
    } else {
        return false
    }
}

function isOutOfHealth(theSnake) {
    if (theSnake.health <= 0) return true
    else return false;
}

function isOverfed(theSnake, overfeedTolerance) {
    if (theSnake.health < 100) return false;
    if ((theSnake.health - 100) > overfeedTolerance) return true
    else return false;
}

function getLaggingDirection(directionOutcomes) {
    const lengthCounts = {}
    const compare = []
    for (key in directionOutcomes) {
        let obj = {}
        obj["direction"] = key;
        obj["length"] = directionOutcomes[key].length
        if (lengthCounts[obj.length]) { lengthCounts[obj.length]++ }
        else { lengthCounts[obj.length] = 1 }
        compare.push(obj)
    }
    compare.sort((a, b) => a.length - b.length)
    let noTiedValues = true;
    for (length in lengthCounts) {
        if (lengthCounts[length] > 1) { noTiedValues = false; }
    }
    if (noTiedValues) { return compare[0].direction }
    else { return "" }
}


function getEnemyThreatAndStrikeZones(mySnake,snakes){
    const threatZones = [];
    const strikeZones = [];
    for (const snake of snakes) { 
        if (snake.id === mySnake.id){ continue }
        for (const direction of directions){ 
            if (direction === backwardsDirection(snake)) { continue }
            const zone = {x:snake.body[0].x , y:snake.body[0].y};
            moveHead(zone,direction);
            if (snake.body.length < mySnake.body.length) { strikeZones.push(zone) }
            else { threatZones.push(zone) }
        }
    }
    return [threatZones, strikeZones]
}



if (typeof window !== "object") {
    module.exports = {
        getGameStateWithTurnSimulation,
        getBreadthFirstOutcomesForAllDirectionsAfterNTurns,
        processTurn,
        moveSnake,
        getOppositeDirection,
        getDistanceFromWall,
        getEnemyThreatAndStrikeZones
    }
}
