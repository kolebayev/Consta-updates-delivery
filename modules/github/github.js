const { text } = require('body-parser')
const request = require('request')
const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_BOT_GITHUB_TOKEN)
const imagePath = process.env.HEROKU_APP_URL + '/static/consta-ui-kit.png'
const versionReg = /\#\#\ v([0-9]+\.[0-9]+\.[0-9]+)\ \(([0-9]+\/.[0-9]+\/[0-9]+)\)/m
const githubReleaseUrl =
  'https://github.com/gazprom-neft/consta-uikit/releases/tag/'
const chandgeLogUrl =
  'https://raw.githubusercontent.com/gazprom-neft/consta-uikit/master/CHANGELOG.md'
const chatId = process.env.TELEGRAM_TARGET_GITHUB_CHANNEL_ID

const getReleaseBody = (release) => {
  return release
    .replace('# Changelog\n\n', '')
    .replace(versionReg, '')
    .replace('\n\n', '')
}

const getVersion = (release) => {
  const [full, version, date] = release.match(versionReg)
  return [version, date]
}

module.exports = function (app, client) {
  const db = client.db('constaTelegramBot')
  app.get('/github', (req, res) => {
    request(chandgeLogUrl, (err, response, body) => {
      if (err) return res.status(500).send({ message: err })

      const lastReliase = body.split('---')[0]
      const [version, date] = getVersion(lastReliase)
      const reliaseBody = getReleaseBody(lastReliase)

      const text = `New version has been released\n **v${version} (${date})**\n\n Changelog:\n ${reliaseBody} [open in GitHub](${githubReleaseUrl}v${version})`

      db.collection('versions').findOne({ version }, (err, item) => {
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
                      .collection('versions')
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

      return res.send(version)
    })
  })
}
