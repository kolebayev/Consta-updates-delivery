// name consta-test
// username consta_test_bot

const { Telegraf } = require("telegraf");
const extra = require("telegraf/extra");
const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const port = 3000;
app.use(bodyParser.json());

const TEST_BOT_TOKEN = "1394334012:AAEiuKc-Nvp-GqASCUW1QkoYkgru30D67LE";
const TELEGRAM_CHANNEL_ID = "@constaupdates";
const bot = new Telegraf(TEST_BOT_TOKEN);

// bot.command("oldschool", (ctx) => ctx.reply("Hello"));
// bot.command("modern", ({ reply }) => reply("Yo"));
// bot.command("hipster", Telegraf.reply("λ"));
// bot.start((ctx) => ctx.reply("Welcome!"));
// bot.help((ctx) => ctx.reply("Send me a sticker"));
// bot.on("sticker", (ctx) => ctx.reply("👍"));
// bot.hears("hi", (ctx) => ctx.reply("Hey there"));
// bot.launch();

const returnEditedComponents = (comps) => {
  return comps.map((item) => "- " + item.name).join(",\n");
};

app.post("/", (req, res) => {
  const {
    file_name,
    modified_components,
    created_components,
    deleted_components,
    passcode,
    triggered_by,
    event_type,
    description,
  } = req.body;

  console.log("req:", req.body);

  if (passcode === "123" && event_type === "LIBRARY_PUBLISH") {
    res.sendStatus(200);
    bot.telegram.sendMessage(
      TELEGRAM_CHANNEL_ID,
      `${
        triggered_by.handle
      } обновил(а) библиотеку *${file_name}*.\n${description}\n\n${
        modified_components.length != 0
          ? "✏️ *Измененные компоненты:*\n" +
            returnEditedComponents(modified_components) +
            "\n\n\n"
          : ""
      }${
        created_components.length != 0
          ? "💫 *Новые компоненты:*\n" +
            returnEditedComponents(created_components) +
            "\n\n\n"
          : ""
      }${
        deleted_components.length != 0
          ? "🗑️ *Удаленные компоненты:*\n" +
            returnEditedComponents(deleted_components)
          : ""
      }`,
      extra.markdown()
    );
  } else {
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
