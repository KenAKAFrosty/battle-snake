const { info, move } = require('../src/commandHandlingAndMetadata');
const { getEmptyBoardMap, getBoardMapWithOutOfBoundsApplied, getBoardMapWithSnakeOccupantsApplied } = require('../src/logic/boardMapping.js')

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

describe('Battlesnake Basic Death Prevention', () => {
    test('should never move into its own neck', () => {
        const me = createBattlesnake("me", [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }])
        const gameState = createGameState(me, 7)
        const moveResponse = move(gameState)
        const allowedMoves = ["up", "down", "right"]
        expect(allowedMoves).toContain(moveResponse.move)
    })

    test.skip(`Battlesnake doesn't move out of bounds`, ()=> { 
        const facingDownInBottomLeftCorner = [ {x:0,y:0}, {x:0,y:1}, {x:0,y:2}, {x:0,y:3} ]
        const me = createBattlesnake("me", facingDownInBottomLeftCorner);
        const gameState = createGameState(me, 11);
        const moveResponse = move(gameState);
        const allowedMoves = ["right"];
        expect(allowedMoves).toContain(moveResponse.move);
    })


})


describe('Board Mapping', ()=> { 
    test('Basic empty board properly created with valid positive 2+ integer argument given for size', ()=> { 
        const boardMap = getEmptyBoardMap(11);
        const bottomLeft = boardMap["-1,-1"];
        const topRight = boardMap["11,11"];
        const somewhereInMiddleish = boardMap["5,7"];
        expect(bottomLeft.occupant).toEqual({type:"empty"})
        expect(bottomLeft.valueScore).toEqual(0)
        expect(topRight.occupant).toEqual({type:"empty"})
        expect(topRight.valueScore).toEqual(0)
        expect(somewhereInMiddleish.occupant).toEqual({type:"empty"})
        expect(somewhereInMiddleish.valueScore).toEqual(0)
    })

    test('Properly empty board + out of bounds applied correctly', ()=> { 
        let boardMap = getEmptyBoardMap(11);
        boardMap = getBoardMapWithOutOfBoundsApplied(boardMap, -10);
        const bottomLeft = boardMap["-1,-1"];
        const topRight = boardMap["11,11"];
        const somewhereInMiddleish = boardMap["5,7"];
        expect(bottomLeft.occupant).toEqual({type:"outOfBounds"})
        expect(bottomLeft.valueScore).toEqual(-10)
        expect(topRight.occupant).toEqual({type:"outOfBounds"})
        expect(topRight.valueScore).toEqual(-10)
        expect(somewhereInMiddleish.occupant).toEqual({type:"empty"})
        expect(somewhereInMiddleish.valueScore).toEqual(0)
    })

    test('Applying basic snake occupancy', ()=> { 
        let boardMap = getEmptyBoardMap(11);
        const snakeBodyFacingDownInBottomLeftCorner = [ {x:0,y:0}, {x:0,y:1}, {x:0,y:2}, {x:0,y:3} ];
        const snake = createBattlesnake("snek",snakeBodyFacingDownInBottomLeftCorner);
        boardMap = getBoardMapWithSnakeOccupantsApplied( boardMap, [snake] )
        const head = boardMap["0,0"].occupant;
        const tail = boardMap["0,3"].occupant;
        expect(head.bodyIndex).toEqual(0);
        expect(tail.bodyIndex).toEqual(3);
        expect(boardMap["0,2"].occupant.name).toEqual("snek");
    })
})