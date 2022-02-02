const { info, move } = require('../src/commandHandlingAndMetadata');
const { } = require('../src/logic/moveLogic');
const { getGameStateWithTurnSimulation } = require('../src/logic/turnSimulation')

function createGameState(myBattlesnake,boardHeightAndWidth) {
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
        const me = createBattlesnake("me", [{ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 }])
        const gameState = createGameState(me, 7)
        const moveResponse = move(gameState)
        const allowedMoves = ["up", "down", "right"]
        expect(allowedMoves).toContain(moveResponse.move)
    })

    test(`Battlesnake doesn't move out of bounds`, ()=> { 
        const facingDownInBottomLeftCorner = [ {x:0,y:0}, {x:0,y:1}, {x:0,y:2}, {x:0,y:3} ]
        const me = createBattlesnake("me", facingDownInBottomLeftCorner);
        const gameState = createGameState(me, 11);
        const moveResponse = move(gameState);
        const allowedMoves = ["right"];
        expect(allowedMoves).toContain(moveResponse.move);
    })
})


describe('Food management', ()=> { 
    test('with only 1 health left and immediately adjacent to food above it, with no other threats, should grab food and nothing else', ()=> { 
        const gameState = {
            board:{
                height:11,
                width:11
            },
            you:{
                body:[
                    {x:2,y:1},
                    {x:3,y:1},
                    {x:4,y:1},
                ],
                health:1
            },
            board:{
                food:[
                    {x:2,y:2}
                ]
            }
        }
        const updatedGameState = getGameStateWithTurnSimulation(gameState);
        const directions = updatedGameState.survivalDirections;
        expect(directions.up > 0 ).toEqual(true);
        expect(directions.left === 0).toEqual(true);
        expect(directions.right === 0).toEqual(true);
        expect(directions.down === 0).toEqual(true);
    })
})