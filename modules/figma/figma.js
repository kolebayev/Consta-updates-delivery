const express = require('express')
const router = express.Router()

const { Telegraf } = require('telegraf')
const extra = require('telegraf/extra')
const TEST_BOT_TOKEN = '1394334012:AAEiuKc-Nvp-GqASCUW1QkoYkgru30D67LE'
const TELEGRAM_CHANNEL_ID = '@constaupdates'
const bot = new Telegraf(TEST_BOT_TOKEN)
const tempURL = ''

const FIGMA_775_HOOK_PASSCODE = 'consta-public-lib-updates-1mU9fjJOEC'

const returnEditedComponents = (comps) => {
  return comps.map((item) => '- ' + item.name).join(',\n')
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
  } = req.body

  // console.log('req:', req.body)

  if (
    passcode === FIGMA_775_HOOK_PASSCODE &&
    event_type === 'LIBRARY_PUBLISH'
  ) {
    await bot.telegram.sendPhoto(
      TELEGRAM_CHANNEL_ID,
      tempURL + '/static/consta-ui-kit.png'
    )

    await bot.telegram.sendMessage(
      TELEGRAM_CHANNEL_ID,
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
    res.sendStatus(200)
  } else if (passcode === FIGMA_775_HOOK_PASSCODE && event_type === 'PING') {
    res.sendStatus(200)
  } else {
    res.sendStatus(400)
  }
})

module.exports = router
