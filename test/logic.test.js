const { info, move } = require('../src/commandHandlingAndMetadata');
const { 
    getCoordinateStringOfDirectionFromCoordinateObject,
    getValueScoresOfAllDirectionsFrom,
    getDirectionWithLargestValueScore
} = require('../src/logic/moveLogic');
const { 
    getEmptyBoardMap, 
    getBoardMapWithOutOfBoundsApplied, 
    getBoardMapWithSnakeOccupantsApplied, 
    getBoardMapWithSnakeValueScoresApplied 
} = require('../src/logic/boardMapping.js');

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
    test.skip('should never move into its own neck', () => {
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

describe('Move utilities', ()=> { 
    test('getCoordinateStringOfDirection', ()=> { 
        expect(getCoordinateStringOfDirectionFromCoordinateObject("up",{x:5,y:6})).toEqual("5,7")
        expect(getCoordinateStringOfDirectionFromCoordinateObject("down",{x:5,y:6})).toEqual("5,5")
        expect(getCoordinateStringOfDirectionFromCoordinateObject("right",{x:5,y:6})).toEqual("6,6")
        expect(getCoordinateStringOfDirectionFromCoordinateObject("left",{x:5,y:6})).toEqual("4,6")
    });


    test('get value scores of all directions', ()=> { 
        const boardMap = { 
            "0,1":{valueScore: 3},
            "2,1":{valueScore: 7},
            "1,0":{valueScore: -15},
            "1,2":{valueScore: -10}
        };
        const coordinateObject = {x:1,y:1};
        const valueScoresAllDirections = getValueScoresOfAllDirectionsFrom(coordinateObject, boardMap);
        expect(valueScoresAllDirections["up"]).toEqual(-10);
        expect(valueScoresAllDirections["down"]).toEqual(-15);
        expect(valueScoresAllDirections["left"]).toEqual(3);
        expect(valueScoresAllDirections["right"]).toEqual(7);
    })

    test('get direction with largest value score', ()=> { 
        const valueScores = { 
            "up":3,
            "down":-10,
            "right":0,
            "left":0
        }
        expect (getDirectionWithLargestValueScore(valueScores)).toEqual("up")
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
        expect(tail.bodyLength).toEqual(snakeBodyFacingDownInBottomLeftCorner.length)
    })

    test('Applying basic snake valueScores', ()=> { 
        let boardMap = getEmptyBoardMap(11);
        const snakeBodyFacingDownInBottomLeftCorner = [ {x:0,y:0}, {x:0,y:1}, {x:0,y:2}, {x:0,y:3} ];
        const snake = createBattlesnake("snek",snakeBodyFacingDownInBottomLeftCorner);
        boardMap = getBoardMapWithSnakeOccupantsApplied( boardMap, [snake] )
        boardMap = getBoardMapWithSnakeValueScoresApplied( boardMap );
        const head = boardMap["0,0"];
        const tail = boardMap["0,3"];
        expect(head.valueScore).toEqual(0);
        expect(tail.valueScore).toEqual(2);
        expect(boardMap["0,2"].valueScore).toEqual(-10);
    })
})