const {processTurn} = require("./turnSimulation");

const express = require('express')
const app = express()
app.use(express.json())
const port = 2000

app.get("/", (req, res) => { 
    console.log('received request at /');
    console.log(req.body)
    res.send("hey!")
})

app.post("/processTurn", (req, res) => {
    console.log('received request at /processTurn');
    console.log(req.body)
    const passedArguments = req.body.passedArguments;
    const outcomes = processTurn(...passedArguments);
    res.send( {outcomes} )
});

// Start the Express server
app.listen(port, () => {
    console.log(`Starting processTurn worker at  http://0.0.0.0:${port}...`)
})

