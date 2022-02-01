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

function isCollidedWithBoundary(theSnake, boardSize){ 
    const head = theSnake.body[0];
    if (head.x < 0 || head.y < 0 || head.x >= boardSize || head.y >= boardSize){ 
        return true;
    } else { 
        return false
    }
}

const snek = {
    health: 100,
    turns: 0,
    body: [
        {x: 10, y: 1},
        {x: 9, y: 1},
        {x: 8, y: 1},
        {x: 7, y: 1},
        {x: 6, y: 1},
        {x: 5, y: 1},
        {x: 4, y: 1},
        {x: 3, y: 1},
        {x: 2, y: 1},
        {x: 1, y: 1},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 0, y: 3},
        {x: 0, y: 4},
        {x: 0, y: 5},
        {x: 0, y: 6},
        {x: 0, y: 7},
        {x: 0, y: 8},
        {x: 0, y: 9},
        {x: 0, y: 10},
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
    ]
}

function getBreadthFirstOutcomesForAllDirectionsAfterNTurns(directions, turnsToLookAhead) {
    const outcomes = [snek];
    for (let i = 0; i < outcomes.length; i++) {
        const snake = outcomes[i];
        if (snake.turns && snake.turns >= turnsToLookAhead) { break }
        for (const direction of directions) {
            const copy = JSON.parse(JSON.stringify(snake));
            move(copy, direction)
            copy.turns++
            const selfCollided = isCollidedWithBodyPart(copy, [copy])
            const boardCollided = isCollidedWithBoundary(copy, 11)
            if (!selfCollided && !boardCollided) {
                outcomes.push(copy);
            }
        }
        delete outcomes[i];
    }
    return outcomes;
}

console.time("checking results")
const outcomes = getBreadthFirstOutcomesForAllDirectionsAfterNTurns(["up", "down", "left", "right"], 7);
for (direction of ["up", "down", "left", "right"]) { 
    console.log(direction, outcomes.filter(e=>e.originalDirection === direction).length)
}
console.timeEnd("checking results")
console.log(outcomes);