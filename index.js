// bot name consta-test
// bot username consta_test_bot

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000

const figma = require('./modules/figma/figma')
const github = require('./modules/github/github')

app.use('/static', express.static('static'))
app.use(bodyParser.json())
app.use('/', figma)
app.use('/', github)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
