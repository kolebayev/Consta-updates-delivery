// bot name consta-test
// bot username consta_test_bot
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const request = require('request')
require('dotenv').config()
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || '8080'

const figma = require('./modules/figma/figma')
const github = require('./modules/github/github')

app.use('/static', express.static('static'))
app.use(bodyParser.json())
app.use('/', figma)

MongoClient.connect(
  process.env.MONGO_DB_URL,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  (err, client) => {
    if (err) return console.log(err)

    github(app, client)

    app.listen(port, () => {
      console.log(`app listening at ${port}`)
    })
  }
)
