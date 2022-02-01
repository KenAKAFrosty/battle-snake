const treeObject = {
    value:"cat",
    2:{ 
        value:"dog",
        5:{
            value:"wolf"
        },
        6:{
            value:"tiger"
        }
    },
    3:{
        value:"hippo",
        11:{
            value:"rhino"
        },
        12:{
            value:"kangaroo",
            87:{
                value:"capybara"
            }
        },
        13:{
            value:"sloth"
        },
    },
    4:{
        value:"fox",
        7:{
            value:"snake"
        },
        8:{
            value:"iguana"
        },
        9:{
            value:"panther"
        },
        10:{
            value:"lion",
        }
    },
    23:{
        value:"old turtle",
        100:{
            value:"hare"
        },
        7683:{
            value:"beetle"
        },
        28:{
            value:"squirrel"
        }
    }
}




const snake = { 
    value:"snake"
}
const beetle = { 
    value:"beetle"
}
const turtle = { 
    value:"turtle",
    beetle
}
const hare = { 
    value:"hare",
    beetle,
    snake
}
const wolf = { 
    value:"wolf",
    hare
}
console.log(hare);
beetle["turtle"] = turtle;
beetle["hare"] = hare;
beetle["wolf"] = wolf;


breadthFirstPractice()

function breadthFirstPractice(){ 
    // const allValues = [treeObject.value];
    // storeAllBranchesValuesInArrayBreadthFirst(treeObject,allValues);
    console.log(getValuesOfVisitedNodesBreadthFirst(treeObject));
    console.log(getValuesOfVisitedNodesBreadthFirst(beetle))
}

// function storeAllBranchesValuesInArrayBreadthFirst(object, arrayTostore){ 
//     if (!object.nextBranches){return}
//     for (const branchId of object.nextBranches){ 
//         arrayTostore.push(object[branchId].value)
//     }
//     for (const branchId of object.nextBranches){ 
//         storeAllBranchesValuesInArrayBreadthFirst(object[branchId], arrayTostore)
//     }
// }


function getValuesOfVisitedNodesBreadthFirst(object){ 
    const visited = [];
    const queue = [];
    do {
        const nextBranches = getNextBranches(object) || []
        for (const branch of nextBranches){ 
            if ( !visited.includes(branch.value) )
            queue.push(branch);
        }
        visited.push(object.value);
        const frontOfQueue = queue.shift();
        object = frontOfQueue;
        if (queue.length === 0) { visited.push(object.value)}

    } while (queue.length > 0 );

    return visited;
}


function objectDeepEquals(object1,object2){ 
    return JSON.parse(JSON.stringify(object1)) === JSON.parse(JSON.stringify(object2))
}

function objectExistsInArray(object,array){
    for (item of array){ 
        if (typeof item !== "object") { continue };
        if (objectDeepEquals(item,object)) { return true }
    }
    return false; 
}

function getNextBranches(object){ 
    const branches = [];
    for (key in object){ 
        const value = object[key];
        if (typeof value !== "object") { continue }
        branches.push(value)
    }
    if (branches.length > 0 ) return branches;
    else return false
}