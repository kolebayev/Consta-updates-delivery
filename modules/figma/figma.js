const express = require('express')
const router = express.Router()
const { Telegraf } = require('telegraf')
const extra = require('telegraf/extra')
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const imagePath = process.env.HEROKU_APP_URL + '/static/'

const returnEditedComponents = (comps) => {
  return comps.map((item) => '- ' + item.name).join(',\n')
}

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
    modified_components,
    created_components,
    deleted_components,
    passcode,
    triggered_by,
    event_type,
    description,
    file_key,
  } = req.body

  const sendMessage = () => {
    bot.telegram.sendMessage(
      process.env.TELEGRAM_TARGET_CHANNEL_ID,
      `${
        triggered_by.handle
      } обновил(а) библиотеку *${file_name}*.\n${description}\n\n${
        modified_components.length != 0
          ? '✏️ *Измененные компоненты:*\n' +
            returnEditedComponents(modified_components) +
            '\n\n\n'
          : ''
      }${
        created_components.length != 0
          ? '💫 *Новые компоненты:*\n' +
            returnEditedComponents(created_components) +
            '\n\n\n'
          : ''
      }${
        deleted_components.length != 0
          ? '🗑️ *Удаленные компоненты:*\n' +
            returnEditedComponents(deleted_components)
          : ''
      }`,
      extra.markdown()
    )
  }

  const sendImage = (file_key) => {
    bot.telegram
      .sendPhoto(
        process.env.TELEGRAM_TARGET_CHANNEL_ID,
        imagePath + FIGMA_FILE_NAMES[file_key]
      )
      .catch((err) => console.log(err))
    return
  }

  if (
    // проверка секретного кода для сесурности
    passcode === process.env.FIGMA_775_HOOK_PASSCODE &&
    // проверка, что сработал нужный хук
    event_type === 'LIBRARY_PUBLISH' &&
    // проверка, что проект хука входит в список публичных
    Object.keys(FIGMA_FILE_NAMES).includes(file_key) === true
  ) {
    // если дескрипшен приходит с -,
    // то телега не постит сообщение в канал
    // это ручной контроль
    if (description !== '-') {
      // отправляем картинку по названию
      await sendImage(file_key)
      // sendMessage()
      setTimeout(sendMessage, 1000)
      res.sendStatus(200)
    } else {
      // если мы не постим сообщение в телегу,
      // фигме все равно нужно отправлять 200
      // чтобы хук не заморозили
      res.sendStatus(200)
      console.log('message will not be sent due to description')
    }
  } else if (
    passcode === process.env.FIGMA_775_HOOK_PASSCODE &&
    event_type === 'PING'
  ) {
    res.sendStatus(200)
  } else {
    console.log('err id')
    res.sendStatus(400)
  }
})

module.exports = router
