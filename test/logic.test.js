const { info, move } = require('../src/commandHandlingAndMetadata');
const { getDirectionValuesFromOutcomes,
    getBestChoiceFromDirectionValues,
    snakesAreEqual
} = require('../src/logic/moveLogic');
const { getGameStateWithTurnSimulation, moveSnake, getOppositeDirection, getDistanceFromWall, getEnemyThreatAndStrikeZones
} = require('../src/logic/turnSimulation')

function createGameState(myBattlesnake, boardHeightAndWidth) {
    return {
        game: {
            id: "",
            ruleset: { name: "", version: "" },
            timeout: 0
        },
        turn: 0,
        board: {
            height: boardHeightAndWidth,
            width: boardHeightAndWidth,
            food: [],
            snakes: [myBattlesnake],
            hazards: []
        },
        you: myBattlesnake
    }
}

function createBattlesnake(id, bodyCoords) {
    return {
        id: id,
        name: id,
        health: 100,
        body: bodyCoords,
        latency: "",
        head: bodyCoords[0],
        length: bodyCoords.length,
        shout: "",
        squad: ""
    }
}

describe('Battlesnake API Version', () => {
    test('should be api version 1', () => {
        const result = info()
        expect(result.apiversion).toBe("1")
    })
})

describe('Battlesnake Basic Death Prevention', () => {
    test('should never move into its own neck', async () => {
        const me = createBattlesnake("me", [{ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 }])
        const gameState = createGameState(me, 7);
        gameState.ateLastRound = {}
        const moveResponse = await move(gameState)
        const allowedMoves = ["up", "down", "right"]
        expect(allowedMoves).toContain(moveResponse.move)
    })

    test(`Battlesnake doesn't move out of bounds`, async () => {
        const facingDownInBottomLeftCorner = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }]
        const me = createBattlesnake("me", facingDownInBottomLeftCorner);
        const gameState = createGameState(me, 11);
        gameState.ateLastRound = {}
        const moveResponse = await move(gameState);
        const allowedMoves = ["right"];
        expect(allowedMoves).toContain(moveResponse.move);
    })
})


describe('Food management', () => {
    test('with only 1 health left and immediately adjacent to food above it, with o other threats, should grab food and nothing else', async () => {
        const gameState = {
            id: "tester",
            board: {
                height: 11,
                width: 11
            },
            you: {
                body: [
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                ],
                health: 1
            },
            board: {
                food: [
                    { x: 2, y: 2 }
                ],
                snakes: [{
                    body: [
                        { x: 2, y: 1 },
                        { x: 3, y: 1 },
                        { x: 4, y: 1 },
                    ],
                    health: 1
                }]
            },
            ateLastRound: {}
        }
        const updatedGameState = await getGameStateWithTurnSimulation(gameState);
        const directions = getDirectionValuesFromOutcomes(updatedGameState.outcomes)
        expect(directions.up > 0).toEqual(true);
        expect(directions.left === 0).toEqual(true);
        expect(!directions.right).toEqual(true);
        expect(directions.down === 0).toEqual(true);
    })

    test('is aware that eating will cause elongation, tail is not safe the round after eating', async () => {
        const gameState = {
            you: {
                id: "tester",
                body: [
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                    { x: 4, y: 2 },
                    { x: 3, y: 2 },
                    { x: 2, y: 2 }
                ],
                health: 100
            },
            board: {
                height: 11,
                width: 11,
                snakes: [{
                    id: "tester",
                    body: [
                        { x: 2, y: 1 },
                        { x: 3, y: 1 },
                        { x: 4, y: 1 },
                        { x: 4, y: 2 },
                        { x: 3, y: 2 },
                        { x: 2, y: 2 }
                    ],
                    health: 100
                }],
                food: [{ x: 1, y: 1 }]
            },
            ateLastRound: {
                "tester": true
            },
            overfeedTolerance: 100
        }

        const updatedGameState = await getGameStateWithTurnSimulation(gameState);
        const directions = getDirectionValuesFromOutcomes(updatedGameState.outcomes)
        expect(directions.up === 0).toEqual(true);
        expect(directions.left > 0).toEqual(true);
        expect(directions.down > 0).toEqual(true);
    })

    test('with an overfeed tolerance set, will not grab nearby food if full', async () => {
        const gameState = {
            you: {
                id: "tester",
                body: [
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                    { x: 4, y: 2 },
                    { x: 3, y: 2 },
                    { x: 2, y: 2 }
                ],
                health: 100
            },
            board: {
                height: 11,
                width: 11,
                snakes: [{
                    id: "tester",
                    body: [
                        { x: 2, y: 1 },
                        { x: 3, y: 1 },
                        { x: 4, y: 1 },
                        { x: 4, y: 2 },
                        { x: 3, y: 2 },
                        { x: 2, y: 2 }
                    ],
                    health: 100
                }],
                food: [{ x: 1, y: 1 }]
            },
            ateLastRound: {
                "tester": true
            },
            overfeedTolerance: 5
        }

        const updatedGameState = await getGameStateWithTurnSimulation(gameState);
        const allOutcomes = updatedGameState.outcomes;
        const avoidOverfeeding = {}
        for (direction in allOutcomes) {
            avoidOverfeeding[direction] = allOutcomes[direction].filter(e => !e.overfed);
        }
        const avoidOverfeedingDirections = getDirectionValuesFromOutcomes(avoidOverfeeding);
        expect(avoidOverfeedingDirections.up === 0).toEqual(true);
        expect(avoidOverfeedingDirections.left === 0).toEqual(true);
        expect(!avoidOverfeedingDirections.right).toEqual(true);
        expect(avoidOverfeedingDirections.down > 0).toEqual(true);
    })

    test('with an overfed tolerance set, when faced with only non-death options that will overfeed, will fall back to survival and take one of those', async () => {
        const gameState = {
            you: {
                id: "tester",
                body: [
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                    { x: 4, y: 2 },
                    { x: 3, y: 2 },
                    { x: 2, y: 2 }
                ],
                health: 100
            },
            board: {
                height: 11,
                width: 11,
                snakes: [{
                    id: "tester",
                    body: [
                        { x: 2, y: 1 },
                        { x: 3, y: 1 },
                        { x: 4, y: 1 },
                        { x: 4, y: 2 },
                        { x: 3, y: 2 },
                        { x: 2, y: 2 }
                    ],
                    health: 100
                }],
                food: [
                    { x: 1, y: 1 },
                    { x: 2, y: 0 }
                ]
            },
            ateLastRound: {
                "tester": true
            },
            overfeedTolerance: 5
        }

        let directions;
        const updatedGameState = await getGameStateWithTurnSimulation(gameState);
        const allOutcomes = updatedGameState.outcomes;
        const avoidOverfeeding = {}
        for (direction in allOutcomes) {
            avoidOverfeeding[direction] = allOutcomes[direction].filter(e => !e.overfed);
        }
        const avoidOverfeedingDirections = getDirectionValuesFromOutcomes(avoidOverfeeding);
        const bestNotOverfedChoice = getBestChoiceFromDirectionValues(avoidOverfeedingDirections);
        if (bestNotOverfedChoice) { directions = avoidOverfeedingDirections } else {
            const survivalDirections = getDirectionValuesFromOutcomes(allOutcomes);
            directions = survivalDirections
        }

        expect(directions.up === 0).toEqual(true);
        expect(directions.left > 0).toEqual(true);
        expect(!directions.right).toEqual(true);
        expect(directions.down > 0).toEqual(true);
    })
})


describe('Misc. utilities', () => {
    test('properly asseses two equal snakes as equal', () => {
        const snake1 = {
            id: "one",
            body: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 2 },
                { x: 3, y: 3 }
            ]
        }
        const snake2 = {
            id: "two",
            body: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 2 },
                { x: 3, y: 3 }
            ]
        }
        expect(snakesAreEqual(snake1, snake2)).toEqual(true);

    })

    test('properly asseses two non-equal snakes are not equal', () => {
        const snake1 = {
            id: "one",
            body: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 2 },
                { x: 3, y: 3 }
            ]
        }
        const snake2 = {
            id: "two",
            body: [
                { x: 2, y: 5 },
                { x: 2, y: 6 },
                { x: 2, y: 7 },
            ]
        }
        expect(snakesAreEqual(snake1, snake2)).toEqual(false);
    })

    test('properly gets the distance from all walls', () => {
        const coords = { x: 1, y: 2 };
        const boardSize = 11;
        const distanceToRightWall = getDistanceFromWall(coords, "right", boardSize);
        expect(distanceToRightWall).toEqual(9)
        const distanceToUpWall = getDistanceFromWall(coords, "up", boardSize);
        expect(distanceToUpWall).toEqual(8)
        const distanceToLeftWall = getDistanceFromWall(coords, "left", boardSize);
        expect(distanceToLeftWall).toEqual(1)
        const distanceToDownWall = getDistanceFromWall(coords, "down", boardSize);
        expect(distanceToDownWall).toEqual(2)
    })
})

describe('Backwards searching', () => {
    test('single move', () => {
        const snake1 = {
            id: "one",
            body: [
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 2 },
                { x: 4, y: 2 }
            ]
        }
        const snake2 = {
            id: "two",
            body: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 2 }
            ]
        }
        snake2.body.reverse();
        moveSnake(snake2, "right");
        snake2.body.reverse();
        expect(snakesAreEqual(snake1, snake2)).toEqual(true);
    })
    test('two moves', () => {
        const snake1 = {
            id: "one",
            body: [
                { x: 2, y: 2 },
                { x: 3, y: 2 },
                { x: 3, y: 3 },
                { x: 4, y: 3 }
            ]
        }
        const snake2 = {
            id: "two",
            body: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 2 }
            ]
        }
        snake2.body.reverse();
        moveSnake(snake2, "up");
        moveSnake(snake2, "right");
        snake2.body.reverse();
        expect(snakesAreEqual(snake1, snake2)).toEqual(true);
    })
})

describe('Combat', () => {
    test('properly identifies strike/threat zones', () => {
        const snakes = [
            {
                id:"smallerBody",
                body: [
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                ]
            },
            {
                id:"me",
                body:[
                    { x: 2, y: 8 },
                    { x: 3, y: 8 },
                    { x: 4, y: 8 },
                    { x: 5, y: 8 },
                ]
            },
            {
                id:"largerBody",
                body:[
                    { x: 2, y: 5 },
                    { x: 3, y: 5 },
                    { x: 4, y: 5 },
                    { x: 5, y: 5 },
                    { x: 6, y: 5 },
                ]
            }
        ];
        const [threatZones, strikeZones] = getEnemyThreatAndStrikeZones(snakes[1],snakes);
        expect(threatZones).toEqual([
            {x: 2, y:6},
            {x: 2, y:4},
            {x: 1, y:5},
        ]);
        expect(strikeZones).toEqual([
            {x:2,y:2},
            {x:2,y:0},
            {x:1,y:1}
        ])

    })
})