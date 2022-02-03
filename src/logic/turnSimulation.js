const directions = ["up", "down", "left", "right"]
const defaultNumberOfTurnsToLookAhead = 7;


function getGameStateWithTurnSimulation(gameState, turnsToLookAhead) {
    turnsToLookAhead = turnsToLookAhead || defaultNumberOfTurnsToLookAhead
    gameState.you.turns = 0;
    gameState = getBreadthFirstOutcomesForAllDirectionsAfterNTurns(turnsToLookAhead, gameState);
    return gameState;
}

async function getBreadthFirstOutcomesForAllDirectionsAfterNTurns(turnsToLookAhead, gameState) {
    const initial = { snake: gameState.you, ateLastRound: gameState.ateLastRound }
    const backwards = backwardsDirection(initial.snake);

    //initial setup for each original direction taken
    let directionOutcomes = {}
    for (const direction of directions) {
        if (direction !== backwards) {
            directionOutcomes[direction] = [initial]
            directionOutcomes[direction]["i"] = 0;
            processTurn(direction, directionOutcomes[direction], 0, gameState);
            directionOutcomes[direction].shift(); //the 0 element is still the current-state copy, we want that out now
        }
    }

    let laggingDirection = "";
    for (let turn = 1; turn < turnsToLookAhead; turn++) { //remove this for depth first
        for (const direction of directions) {
            if (!directionOutcomes[direction] || direction === laggingDirection) { continue }
            let outcomes = directionOutcomes[direction];
            const startingLength = outcomes.length;

            for (outcomes.i; outcomes.i < startingLength; outcomes.i++) { //swap out startingLength for outcomes.length for depth-first
                //if (snake.turns >= turnsToLookAhead){break} <---- this is used for depth-first
                const backwards = backwardsDirection(outcomes[outcomes.i].snake);
                for (const directionToSimulate of directions) {
                    if (directionToSimulate === backwards) { continue };
                    
                    outcomes = processTurn(directionToSimulate, outcomes, outcomes.i, gameState);
                }
            }
        }
        if (!laggingDirection) { //remove this for depth-first
            laggingDirection = getLaggingDirection(directionOutcomes) //remove this for depth-first
        } //remove this for depth-first
    } //remove this for depth first

    for (key in directionOutcomes) {
        directionOutcomes[key] = directionOutcomes[key].filter(e => e.snake.turns === turnsToLookAhead);
    }

    gameState.outcomes = directionOutcomes
    return gameState;
}

function processTurn(direction, outcomes, i, gameState) {
    const snake = outcomes[i].snake;
    let ateLastRound = outcomes[i].ateLastRound;
    let overfed = outcomes[i].overfed;
    let ateFood = outcomes[i].ateFood;
    const copy = JSON.parse(JSON.stringify(snake));
    copy.health--
    move(copy, direction, ateLastRound)
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
    const died = didSnakeDie(copy, gameState);
    if (!died) {
        if (copy.health > 99) { copy.health = 99 }
        outcomes.push({ snake: copy, ateLastRound, overfed, ateFood });
    }
    return outcomes;
}


function didSnakeDie(copy, gameState) {
    const snakeCollided = isCollidedWithBodyPart(copy, gameState.board.snakes);
    const boardCollided = isCollidedWithBoundary(copy, gameState.board.width);
    const outOfHealth = isOutOfHealth(copy);
    return snakeCollided || boardCollided || outOfHealth
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



function move(snake, direction, ateLastRound) {
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
        for (const part of snake.body.slice(1)) {
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


if (typeof window !== "object") {
    module.exports = {
        getGameStateWithTurnSimulation,
        getBreadthFirstOutcomesForAllDirectionsAfterNTurns,
        processTurn
    }
}
