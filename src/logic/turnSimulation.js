const directions = ["up", "down", "left", "right"]
const defaultNumberOfTurnsToLookAhead = 7;

function getGameStateWithTurnSimulation(gameState, turnsToLookAhead) {
    turnsToLookAhead = turnsToLookAhead || defaultNumberOfTurnsToLookAhead
    const mySnake = gameState.you;
    mySnake.turns = 0;
    gameState = getBreadthFirstOutcomesForAllDirectionsAfterNTurns(turnsToLookAhead, gameState);
    return gameState;
}

function getBreadthFirstOutcomesForAllDirectionsAfterNTurns(turnsToLookAhead, gameState) {
    const now = Number(new Date());
    const outcomes = [{ snake: gameState.you, ateLastRound: gameState.ateLastRound }];
    for (let i = 0; i < outcomes.length; i++) {
        // come back to this time testing, but leave out for now;
        // const nowAgain = Number(new Date());
        // const difFromStart = nowAgain - now;
        // if (difFromStart > 400) { break }
        const snake = outcomes[i].snake;
        if (snake.turns && snake.turns >= turnsToLookAhead) { break }
        for (const direction of directions) {
            const directionFacing = getDirectionFacing(snake);
            const oppositeDirection = getOppositeDirection(directionFacing);
            if (direction === oppositeDirection) { continue }
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
            const snakeCollided = isCollidedWithBodyPart(copy, gameState.board.snakes)
            const boardCollided = isCollidedWithBoundary(copy, gameState.board.width)
            const outOfHealth = isOutOfHealth(copy);

            if (!snakeCollided && !boardCollided && !outOfHealth) {
                if (copy.health > 99) { copy.health = 99 }
                outcomes.push({ snake: copy, ateLastRound, overfed, ateFood });
            }
        }

        delete outcomes[i];
    }
    gameState.outcomes = outcomes
    return gameState;
}



function move(snake, direction, ateLastRound) {
    moveBody(snake, ateLastRound)
    moveHead(snake.body[0], direction)
    if (!snake["originalDirection"]) snake["originalDirection"] = direction;
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



if (typeof window !== "object") {
    module.exports = {
        getGameStateWithTurnSimulation,
        getBreadthFirstOutcomesForAllDirectionsAfterNTurns
    }
}
