const express = require('express')
const router = express.Router()
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const imagePath = process.env.HEROKU_APP_URL + '/static/'

const FIGMA_FILE_NAMES = {
  FbMoYQEp4wAbaspkGSvcgt: 'testing-hooks.png',
  v9Jkm2GrymD277dIGpRBSH: 'consta-ui-kit.png',
  SLc0YGhuDotve6MTCBHlGxDU: 'consta-graphics.png',
  nJiG1WdTWgqTd2RQc3ltv2: 'consta-default-spaces.png',
  '4FOymgclcGF3Fm2M9ZeNUk': 'consta-default-typography.png',
  NgRz8tesBgdad2Lv6kbWEe: 'consta-dark-colors.png',
  vNZFtFH6w0IjD2Twi5OXXE: 'consta-default-colors.png',
  CjGnwm0kwWkW9wSgwPirJA: 'consta-display-colors.png',
}

router.post('/figma', async (req, res) => {
  const {
    file_name,
    passcode,
    triggered_by,
    event_type,
    description,
    file_key,
    timestamp,
    modified_components,
    retries,
  } = req.body

  if (passcode === process.env.FIGMA_775_HOOK_PASSCODE) {
    // https://www.figma.com/developers/api#webhooks-v2-events
    // пинг шлет сама фигма, обрабатывать не нужно
    // только ответ 200, что сервак крутится
    if (event_type === 'PING') {
      console.log('PING_EVENT')
      res.sendStatus(200)
    }
    // обрабатываем только этот тип событий
    if (event_type === 'LIBRARY_PUBLISH') {
      // шлем сообщения только для публичных
      // проектов из комьюнити Консты
      if (
        Object.keys(FIGMA_FILE_NAMES).includes(file_key) &&
        modified_components.length != 0
      ) {
        // проверяем конфиг на параметр noPost
        if (description.includes('#nopost#') === false) {
          bot.telegram
            .sendPhoto(
              process.env.TELEGRAM_TARGET_CHANNEL_ID,
              imagePath + FIGMA_FILE_NAMES[file_key],
              {
                caption: `${triggered_by.handle} обновил(а) библиотеку *${file_name}*.\n\n${description}\n\nr: ${retries}, ${timestamp}`,
                parse_mode: 'Markdown',
              }
            )
            .catch((err) =>
              console.log(
                `SEND PHOTO WITH CAPTION FAILED // ${timestamp} //  `,
                err
              )
            )
        }
      }
      // 200 на любые хуки публикаций
      // иначе хук отключается
      res.sendStatus(200)
    }
  } else {
    // https://www.figma.com/developers/api#webhooks-v2-security
    // если паскод неверный
    console.log('PASSCODE_ERROR')
    res.sendStatus(400)
  }
})

module.exports = router
