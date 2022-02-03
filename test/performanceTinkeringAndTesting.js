const { getGameStateWithTurnSimulation } = require('../src/logic/turnSimulation.js');

const you = {
    id: "tester",
    body: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
    ],
    health: 100
}
const gameState = {
    board: {
        height: 11,
        width: 11
    },
    you,
    board: {
        food: [],
        snakes:[you]
    },
    ateLastRound: {}
}


// console.log(`Number of turns we can complete in time: ${howManyTurnsInUnder(400, gameState)}`);
const [turns, outcomes] = howManyTurnsInUnder(400, gameState);
console.log('turns:',turns);
console.log('outcomes:',outcomes)
// console.log(checkOutcomes(gameState,2))

function howManyTurnsInUnder(milliseconds, gameState){ 
   
    const safeguard  = 20; 
    let numberOfTurns = 0;
    let outcomesLengths = {}
    for (let i = 1; i <= safeguard; i ++){ 
        const start = performance.now();
        const state = getGameStateWithTurnSimulation(gameState,i)
        const end = performance.now();
        const timeTaken = end-start;
        outcomesLengths[i] = state.outcomes.length;
        console.log(`${i} turns took ${timeTaken} milliseconds and produced ${state.outcomes.length} outcomes`)
        if (timeTaken > milliseconds) { 
            numberOfTurns = i-1;
            break;
        }
    }
    return [numberOfTurns, outcomesLengths[numberOfTurns]]
}

function checkOutcomes(gameState, numberOfTurns){ 
    const state = getGameStateWithTurnSimulation(gameState,numberOfTurns);
    return state.outcomes;
}