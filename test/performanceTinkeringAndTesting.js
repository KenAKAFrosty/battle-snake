const { getGameStateWithTurnSimulation } = require('../src/logic/turnSimulation.js');
const { performance } = require('perf_hooks');
const forks = require('os').cpus().length;
const cluster = require ('cluster');

// if (cluster.isMaster){ 
//     console.log(`master ${process.pid}`)
//     console.log('number of cpus:', forks)
//     for (let i = 0; i < forks; i++) { 
//         cluster.fork()
//     }
// } else { 
//     console.log(`worker: process ${process.pid}, worker id: ${cluster.worker.id} `)
//     process.exit(0);
// }

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
    you,
    board: { 
        food: [],
        snakes:[you],
        height: 11,
        width: 11
    },
    ateLastRound: {}
}

test();


async function test(){
    const [turns, outcomes] = await howManyTurnsInUnder(400, gameState);
    console.log('turns:',turns);
    console.log('outcomes:',outcomes)
    // const outcomes = await checkOutcomes(gameState,2);
    // for (element of outcomes.left){ 
    //     console.log(element.snake.body)
    // }
}

async function howManyTurnsInUnder(milliseconds, gameState){ 
    console.log(`Testing max turns we can look ahead within ${milliseconds}ms`)
    const safeguard  = 20; 
    let numberOfTurns = 0;
    let outcomesLengths = {}
    for (let i = 1; i <= safeguard; i ++){ 
        const start = performance.now();
        const state = await getGameStateWithTurnSimulation(gameState,i)
        const end = performance.now();
        const timeTaken = end-start;
        let totalNumberOfOutcomes = 0;
        for (key in state.outcomes){ totalNumberOfOutcomes += state.outcomes[key].length }
        outcomesLengths[i] = totalNumberOfOutcomes;
        console.log(`${i} turns took ${timeTaken} milliseconds and produced ${totalNumberOfOutcomes} outcomes`)
        if (timeTaken > milliseconds) { 
            numberOfTurns = i-1;
            break;
        }
    }
    return [numberOfTurns, outcomesLengths[numberOfTurns]]
}

async function checkOutcomes(gameState, numberOfTurns){ 
    const state = await getGameStateWithTurnSimulation(gameState,numberOfTurns);
    return state.outcomes;
}