
const directions = ["up", "down", "left", "right"];

function getBreadthFirstCheckForAllDirectionsAfterNTurns(directions, turnsToLookAhead) {
    const travelers = [ createTraveler() ];
    for (let i = 0; i < travelers.length; i++) {
        const traveler = travelers[i];
        if (traveler.health <= 0) { 
            delete travelers[i];
            continue 
        } else if (traveler.health > 20){ 
            continue;
        }
        if (traveler.turns && traveler.turns >= turnsToLookAhead){break}
        for (const direction of directions) {
            const copy = {...traveler};
            move(copy, direction)
            travelers.push(copy);
        }
        delete travelers[i];
    }
    return travelers;
}


const results = getBreadthFirstCheckForAllDirectionsAfterNTurns(["up", "down", "left", "right"], 10);
console.time("checking results")
results.sort( (a,b) => a.health - b.health);
console.timeEnd("checking results")
const onlyAlive = results.filter(e => e.health > 0);
const upCount = onlyAlive.filter(e=>e.originalDirection === "up").length;
const downCount = onlyAlive.filter(e=>e.originalDirection === "down").length;
const rightCount = onlyAlive.filter(e=>e.originalDirection === "right").length;
const leftCount = onlyAlive.filter(e=>e.originalDirection === "left").length;

const onlyMaxHealth = results.filter(e=>e.health > 20);
const upCount2 = onlyMaxHealth.filter(e=>e.originalDirection === "up").length;
const downCount2 = onlyMaxHealth.filter(e=>e.originalDirection === "down").length;
const rightCount2 = onlyMaxHealth.filter(e=>e.originalDirection === "right").length;
const leftCount2 = onlyMaxHealth.filter(e=>e.originalDirection === "left").length;

console.log(onlyAlive);
console.log('alive:','up',upCount,'down',downCount,'left',leftCount,'right',rightCount)
console.log('max health:','up',upCount2,'down',downCount2,'left',leftCount2,'right',rightCount2)
// console.log(sortedByHealth);



function createTraveler() {
    return {
        health: 10
    }
}



function move(traveler, direction) {
    const directionToValueDict = {
        "up": -5,
        "down": 1,
        "left": -10,
        "right": -3
    }
    traveler.health += directionToValueDict[direction];
    if (!traveler["originalDirection"]) { traveler["originalDirection"] = direction }
    if (traveler["turns"]) { traveler["turns"]++ }
    else { traveler["turns"] = 1 }

    return traveler
}



function createNonce(length) {
    let nonce = "";
    for (let i = 0; i < length; i++) {
        const randomByte = Math.floor((Math.random() * 255) + 0.99999);
        let displayedAsHex = "";
        if (randomByte < 16) { displayedAsHex += "0" }
        displayedAsHex += randomByte.toString(16);
        nonce += displayedAsHex
    }
    const chars = nonce.split('');
    const startingPlacementForHyphen = 8;
    let hyphenCount = 0;
    for (let i = 0; i < 4; i++) {
        chars.splice(startingPlacementForHyphen + (hyphenCount * 4) + hyphenCount, 0, "-")
        hyphenCount++;
    }
    return chars.join('')

}