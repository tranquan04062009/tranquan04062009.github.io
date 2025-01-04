const TelegramBot = require('node-telegram-bot-api');

// Đọc token từ biến môi trường
const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error('BOT_TOKEN không được định nghĩa. Hãy đặt biến môi trường BOT_TOKEN.');
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Chào bạn! Bot đã khởi động.');
});
