const { info, move } = require('../src/commandHandlingAndMetadata');
const { getDirectionValuesFromOutcomes,
    getBestChoiceFromDirectionValues,
    getDirectionFacing
 } = require('../src/logic/moveLogic');
const { getGameStateWithTurnSimulation } = require('../src/logic/turnSimulation')

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
    test('should never move into its own neck', () => {
        const me = createBattlesnake("me", [{ x: 2, y: 1 }, { x: 1, y:1 }, { x: 0, y: 1 }])
        const gameState = createGameState(me, 7);
        gameState.ateLastRound = {}
        const moveResponse = move(gameState)
        const allowedMoves = ["up", "down", "right"]
        expect(allowedMoves).toContain(moveResponse.move)
    })

    test(`Battlesnake doesn't move out of bounds`, () => {
        const facingDownInBottomLeftCorner = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }]
        const me = createBattlesnake("me", facingDownInBottomLeftCorner);
        const gameState = createGameState(me, 11);
        gameState.ateLastRound = {}
        const moveResponse = move(gameState);
        const allowedMoves = ["right"];
        expect(allowedMoves).toContain(moveResponse.move);
    })
})


describe('Food management', () => {
    test('with only 1 health left and immediately adjacent to food above it, with no other threats, should grab food and nothing else', () => {
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
                snakes:[{
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
        const updatedGameState = getGameStateWithTurnSimulation(gameState);
        const directions = getDirectionValuesFromOutcomes(updatedGameState.outcomes)
        expect(directions.up > 0).toEqual(true);
        expect(directions.left === 0).toEqual(true);
        expect(directions.right === 0).toEqual(true);
        expect(directions.down === 0).toEqual(true);
    })

    test('is aware that eating will cause elongation, tail is not safe the round after eating', () => {
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
                snakes:[{
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

        const updatedGameState = getGameStateWithTurnSimulation(gameState);
        const directions = getDirectionValuesFromOutcomes(updatedGameState.outcomes)
        expect(directions.up === 0).toEqual(true);
        expect(directions.left > 0).toEqual(true);
        expect(directions.down > 0).toEqual(true);
    })

    test('with an overfed tolerance set, will not grab nearby food if full', () => {
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
                snakes:[{
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

        const updatedGameState = getGameStateWithTurnSimulation(gameState);
        const allOutcomes = updatedGameState.outcomes;
        const avoidOverfeeding = allOutcomes.filter(e => !e.overfed);
        const avoidOverfeedingDirections = getDirectionValuesFromOutcomes(avoidOverfeeding);
        const bestNotOverfedChoice = getBestChoiceFromDirectionValues(avoidOverfeedingDirections);

        const survivalDirections = getDirectionValuesFromOutcomes(allOutcomes);
        const bestSurvivalChoice = getBestChoiceFromDirectionValues(survivalDirections);

        expect(avoidOverfeedingDirections.up === 0).toEqual(true);
        expect(avoidOverfeedingDirections.left === 0).toEqual(true);
        expect(avoidOverfeedingDirections.right === 0).toEqual(true);
        expect(avoidOverfeedingDirections.down > 0).toEqual(true);
    })

    test('with an overfed tolerance set, when faced with only non-death options that will overfeed, will fall back to survival and take one of those', () => {
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
                snakes:[{
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
        const updatedGameState = getGameStateWithTurnSimulation(gameState);
        const allOutcomes = updatedGameState.outcomes;
        const avoidOverfeeding = allOutcomes.filter(e => !e.overfed);
        const avoidOverfeedingDirections = getDirectionValuesFromOutcomes(avoidOverfeeding);
        const bestNotOverfedChoice = getBestChoiceFromDirectionValues(avoidOverfeedingDirections);
        if (bestNotOverfedChoice) { directions = avoidOverfeedingDirections } else {
            const survivalDirections = getDirectionValuesFromOutcomes(allOutcomes);
            directions = survivalDirections
        }

        expect(directions.up === 0).toEqual(true);
        expect(directions.left > 0).toEqual(true);
        expect(directions.right === 0).toEqual(true);
        expect(directions.down > 0).toEqual(true);
    })
})