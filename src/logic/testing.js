const axios = require('axios');

run();

async function run() { 
    const response = await axios({ 
        'method':'post',
        'url':'http://localhost:2000/processTurn',
        'Content-Type':'application/json',
        'data':{ 
            'passedArguments':['test','test']
        }
    });
    console.log(response.data);
}