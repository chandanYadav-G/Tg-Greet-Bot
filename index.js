// bot link -> https://t.me/happy_buddybot

// server code
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Telegram bot setup ---
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is not set in environment");
  process.exit(1);
}
const bot = new TelegramBot(token, { polling: true });

let users = [];
if (fs.existsSync("users.json")) {
  users = JSON.parse(fs.readFileSync("users.json", "utf8"));
}
function saveUsers() {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// (Include your existing handlers here: /start, /setbirthday, cron schedules, etc.)
// Example /start handler:
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.chat.first_name;
  if (!users.find((u) => u.id === chatId)) {
    users.push({ id: chatId, name, birthday: null });
    saveUsers();
  }
  bot.sendMessage(
    chatId,
    `👋 Hello ${name}! I’ll greet you daily and wish you on your hday!`
  );
});

// --- Minimal web health route so Render can ping ---
app.get("/", (req, res) => res.send("Bot running"));

app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

console.log("Bot script started (polling).");
