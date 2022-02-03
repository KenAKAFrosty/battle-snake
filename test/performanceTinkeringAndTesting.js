const { getGameStateWithTurnSimulation } = require('../src/logic/turnSimulation.js');

const you = {
    id: "tester",
    body: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
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


console.log(howManyTurnsInUnder(400, gameState));

function howManyTurnsInUnder(milliseconds, gameState){ 
   
    const safeguard  = 15; 
    for (let i = 1; i <= safeguard; i ++){ 
        const start = performance.now();
        getGameStateWithTurnSimulation(gameState,i)
        const end = performance.now();
        const timeTaken = end-start;
        console.log(`${i} turns took ${timeTaken} milliseconds`)
        if (timeTaken > milliseconds) return (i-1)
    }
}