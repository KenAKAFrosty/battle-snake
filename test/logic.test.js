const { info, move } = require('../src/commandHandlingAndMetadata')

function createGameState(myBattlesnake) {
    return {
        game: {
            id: "",
            ruleset: { name: "", version: "" },
            timeout: 0
        },
        turn: 0,
        board: {
            height: 0,
            width: 0,
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
        health: 0,
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

describe('Battlesnake Moves', () => {
    test('should never move into its own neck', () => {
        const me = createBattlesnake("me", [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }])
        const gameState = createGameState(me)
        const moveResponse = move(gameState)
        const allowedMoves = ["up", "down", "right"]
        expect(allowedMoves).toContain(moveResponse.move)
    })
})
