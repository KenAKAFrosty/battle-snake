const express = require('express')
const { info, start, move, end } = require('./commandHandlingAndMetadata')

const app = express()
app.use(express.json())

const port = process.env.PORT || 8080

app.get("/", (req, res) => {
    res.send(info())
});

app.post("/start", (req, res) => {
    res.send(start(req.body))
});

app.post("/move", async (req, res) => {
    const moveMessage = await move(req.body)
    res.send(moveMessage)
});

app.post("/end", (req, res) => {
    res.send(end(req.body))
});

// Start the Express server
app.listen(port, () => {
    console.log(`Starting Battlesnake Server at http://0.0.0.0:${port}...`)
})
