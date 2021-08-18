const { text } = require('body-parser')
const request = require('request')
const { Telegraf } = require('telegraf')
const { CHANGELOG } = require('./__mocks__/data.mock')
const {
  getLastReliase,
  getReleaseBody,
  getVersion,
  getTextMessage,
} = require('./helpers')

const bot = new Telegraf(process.env.TELEGRAM_BOT_GITHUB_TOKEN)
const imagePath = process.env.HEROKU_APP_URL + '/static/package-release.jpg'

const githubUrl = 'https://github.com'
const githubRawUrl = 'https://raw.githubusercontent.com'
const widgetsRepo = 'gazprom-neft/consta-widgets-new'
const constaRepo = 'gazprom-neft/consta-uikit'

const chatId = process.env.TELEGRAM_TARGET_GITHUB_CHANNEL_ID

const getReleasesUrl = (repo) => `${githubUrl}/${repo}/releases/tag/`
const getChanglogUrl = (repo) => `${githubRawUrl}/${repo}/master/CHANGELOG.md`

const sendReleaseMessage = (repo, dbName, libName, { req, res, client }) => {
  const db = client.db('constaTelegramBot')
  const releaseUrl = getReleasesUrl(repo)
  const chandgeLogUrl = getChanglogUrl(repo)

  request(chandgeLogUrl, (err, response, body) => {
    if (err) return res.status(500).send({ message: err })

    const lastReliase = getLastReliase(body)
    const [version, date] = getVersion(lastReliase)
    const reliaseBody = getReleaseBody(lastReliase)
    const text = getTextMessage(libName, version, date, reliaseBody, releaseUrl)

    db.collection(dbName).findOne({ version }, (err, item) => {
      if (err) {
        console.error(err)
        return
      } else {
        if (item === null) {
          bot.telegram
            .sendPhoto(chatId, imagePath, { disable_notification: true })
            .then(() => {
              bot.telegram
                .sendMessage(chatId, text, {
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true,
                })
                .then(
                  db
                    .collection(dbName)
                    .insert({ version, date }, (err, result) => {
                      if (err) {
                        console.error(err)
                      } else {
                        console.log(`DB updated - v${version}`)
                      }
                    })
                )
            })
            .catch((err) =>
              console.error(
                `SEND PHOTO WITH CAPTION FAILED // ${req.body.timestamp} //  `,
                err
              )
            )
        }
      }
    })

    return res.send(text)
  })
}

module.exports = function (app, client) {
  app.get('/github', (req, res) =>
    sendReleaseMessage(constaRepo, 'versions', '@consta/uikit', {
      req,
      res,
      client,
    })
  )
  app.get('/github-widgets', (req, res) =>
    sendReleaseMessage(widgetsRepo, 'widgets-versions', '@consta/widgets', {
      req,
      res,
      client,
    })
  )
  app.get('/github-charts', (req, res) =>
    sendReleaseMessage(
      widgetsRepo,
      'consta-charts-versions',
      '@consta/charts',
      {
        req,
        res,
        client,
      }
    )
  )
}
