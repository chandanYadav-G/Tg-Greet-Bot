// bot link -> https://t.me/happy_buddybot

// server code
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const https = require("https");
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
    `👋 Hello ${name}! I’ll greet you daily and wish you on your birthday! 🎉\n\nUse /setbirthday to tell me your birth date (DD-MM format).`
  );
});

// setting birthday handler
bot.onText(/\/setbirthday (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const date = match[1];
  const user = users.find((u) => u.id === chatId);

  if (user) {
    user.birthday = date;
    saveUsers();
    bot.sendMessage(chatId, `🎂 Got it! I’ll wish you every year on ${date}!`);
  }
});

// Function to send greeting to all users
function sendGreeting(message) {
  users.forEach((u) => bot.sendMessage(u.id, message));
}

// Morning
cron.schedule("0 8 * * *", () => {
  sendGreeting("🌅 Good Morning! Wishing you a day full of smiles!");
});

// Afternoon
cron.schedule("0 13 * * *", () => {
  sendGreeting("🌞 Good Afternoon! Keep going strong!");
});

// Evening
cron.schedule("0 18 * * *", () => {
  sendGreeting("🌇 Good Evening! Hope you had a wonderful day!");
});

// Night
cron.schedule("0 22 * * *", () => {
  sendGreeting("🌙 Good Night! Sweet dreams!");
});

// Birthday wishes
cron.schedule("0 9 * * *", () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB").slice(0, 5); // "DD/MM"
  users.forEach((u) => {
    if (u.birthday && u.birthday.replace("-", "/") === dateStr) {
      bot.sendMessage(
        u.id,
        `🎉 Happy Birthday ${u.name}! 🥳\nWishing you a wonderful year ahead!`
      );
    }
  });
});

// scheduling ping to bot every 5 minutes to keep it awake
cron.schedule("*/5 * * * *", () => {
  https.get("https://tg-greet-bot.onrender.com", (res) => {
    console.log("Pinged render:", res.statusCode);
  });
});

//  Minimal web health route so Render can ping
app.get("/", (req, res) => res.send("Bot running"));

app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

console.log("Bot script started (polling).");
