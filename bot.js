const TelegramBot = require('node-telegram-bot-api');

// Token của bot
const token = '7755708665:AAGrgMh-PDL3QcfGwIyKb22nU_OpG2Z8i-Y';

// Khởi tạo bot với polling
const bot = new TelegramBot(token, { polling: true });

// Lắng nghe tin nhắn /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Chào bạn! Tôi là bot Telegram của bạn.');
});

// Lắng nghe tin nhắn /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Sử dụng lệnh /start để bắt đầu.');
});