const directions = ["up", "down", "left", "right"]

function getGameStateWithTurnSimulation(gameState) {
    const mySnake = gameState.you;
    mySnake.turns = 0;
    const gameStateWithOutcomes = getBreadthFirstOutcomesForAllDirectionsAfterNTurns(directions, 7, gameState.you);
    const survivalDirections = {};
    for (const direction of directions) {
        survivalDirections[direction] = function () {
            return gameStateWithOutcomes.outcomes.filter(e => e.originalDirection === direction).length
        }()
    }
    gameState.survivalDirections = survivalDirections
    return gameState;
}

function getBreadthFirstOutcomesForAllDirectionsAfterNTurns(directions, turnsToLookAhead, gameState) {
    const outcomes = [gameState.you];
    for (let i = 0; i < outcomes.length; i++) {
        const snake = outcomes[i];
        if (snake.turns && snake.turns >= turnsToLookAhead) { break }
        for (const direction of directions) {
            const copy = JSON.parse(JSON.stringify(snake));
            move(copy, direction)
            copy.turns++
            copy.health--
            const foundFood = didFindFood(copy, gameState.board.food)
            if (foundFood) {
                health = 100
                if (!gameState.ateFoodThisRound) { gameState['ateFoodThisRound'] = [] }
                gameState.ateFoodThisRound.push(copy.id);
            }
            const selfCollided = isCollidedWithBodyPart(copy, [copy])
            const boardCollided = isCollidedWithBoundary(copy, 11)
            const outOfHealth = isOutOfHealth(copy);
            if (!selfCollided && !boardCollided && !outOfHealth) {
                outcomes.push(copy);
            }
        }
        delete outcomes[i];
    }
    gameState.outcomes = outcomes
    return gameState;
}



function move(snake, direction) {
    moveBody(snake.body)
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

function moveBody(snake) {
    for (let i = snake.length - 1; i >= 1; i--) {  //ignore head, stop at 1 not 0
        snake[i].x = snake[i - 1].x;
        snake[i].y = snake[i - 1].y;
    }
}

function didFindFood(theSnake, food) {
    for (piece of food) {
        if (piece.x === theSnake.x && piece.y === theSnake.y) {
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







if (typeof window !== "object") {
    module.exports = {
        getGameStateWithTurnSimulation 
    }
}
