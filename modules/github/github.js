const { text } = require('body-parser')
const request = require('request')
const { Telegraf } = require('telegraf')
const { CHANGELOG } = require('./__mocks__/data.mock')
const {
  getLastReliase,
  getReleaseBody,
  getVersion,
  getTextMessage,
  image,
  chatId,
  getReleasesUrl,
  getChanglogUrl,
  npm,
  repo,
  url,
  db,
} = require('./helpers')

const bot = new Telegraf(process.env.TELEGRAM_BOT_GITHUB_TOKEN)

const repos = [
  'uikit',
  'charts',
  'header',
  'rc-tree-adapter',
  'rc-table-adapter',
  'analytic-ui',
  'stats',
  'gantt-task-react-adapter',
  'ag-grid-adapter',
]

const sendReleaseMessage = (
  repo,
  dbName,
  libName,
  image,
  { req, res, client }
) => {
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
            .sendPhoto(chatId, image, { disable_notification: true })
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
  repos.forEach((name) => {
    app.get(url(name), (req, res) =>
      sendReleaseMessage(repo(name), db(name), npm(name), image(name), {
        req,
        res,
        client,
      })
    )
  })
}
