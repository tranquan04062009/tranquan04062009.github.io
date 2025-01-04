const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Cấu hình token bot
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Mảng lưu trữ trạng thái của người dùng
let userStates = {};

// Lệnh /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Chào bạn! Bạn có thể sử dụng các lệnh sau:\n/enc - Mã hóa tệp Python\n/dec - Giải mã tệp Python\nVui lòng gửi tệp sau khi chọn lệnh.");
});

// Lệnh /enc (Mã hóa tệp Python)
bot.onText(/\/enc/, (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = 'enc'; // Đặt trạng thái người dùng là "enc"
  bot.sendMessage(chatId, "Vui lòng gửi tệp Python mà bạn muốn mã hóa.");
});

// Lệnh /dec (Giải mã tệp Python)
bot.onText(/\/dec/, (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = 'dec'; // Đặt trạng thái người dùng là "dec"
  bot.sendMessage(chatId, "Vui lòng gửi tệp Python mà bạn muốn giải mã.");
});

// Xử lý việc nhận tệp người dùng gửi
bot.on('document', (msg) => {
  const chatId = msg.chat.id;
  const file = msg.document;

  if (!userStates[chatId]) {
    bot.sendMessage(chatId, "Vui lòng sử dụng lệnh /enc hoặc /dec trước khi gửi tệp.");
    return;
  }

  const fileName = file.file_name;
  const fileId = file.file_id;

  // Tải tệp và lưu vào thư mục tạm thời
  bot.downloadFile(fileId, './').then((filePath) => {
    const fileExtension = path.extname(fileName);

    if (fileExtension !== '.py') {
      bot.sendMessage(chatId, "Vui lòng gửi tệp Python (.py).");
      return;
    }

    const action = userStates[chatId];

    if (action === 'enc') {
      bot.sendMessage(chatId, "Đang mã hóa tệp...");
      encryptFile(filePath, chatId);
    } else if (action === 'dec') {
      bot.sendMessage(chatId, "Đang giải mã tệp...");
      decryptFile(filePath, chatId);
    }

    // Reset trạng thái sau khi xử lý tệp
    delete userStates[chatId];
  });
});

// Hàm mã hóa tệp Python bằng Marshal
function encryptFile(filePath, chatId) {
  const pythonScript = `
import marshal
import sys

file_path = '${filePath}'
output_path = file_path + '.enc'

# Đọc tệp Python
with open(file_path, 'rb') as f:
    code = f.read()

# Mã hóa tệp
encoded = marshal.dumps(code)

# Lưu tệp mã hóa
with open(output_path, 'wb') as f:
    f.write(encoded)

sys.stdout.write('Mã hóa hoàn thành')
  `;
  
  // Chạy script Python mã hóa
  exec(`python3 -c "${pythonScript}"`, (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(chatId, `Lỗi mã hóa: ${stderr}`);
      return;
    }
    bot.sendMessage(chatId, stdout);
    bot.sendDocument(chatId, `${filePath}.enc`);
    fs.unlinkSync(filePath); // Xóa tệp gốc
  });
}

// Hàm giải mã tệp Python bằng Marshal
function decryptFile(filePath, chatId) {
  const pythonScript = `
import marshal
import sys

file_path = '${filePath}'
output_path = file_path + '.dec'

# Đọc tệp mã hóa
with open(file_path, 'rb') as f:
    encoded = f.read()

# Giải mã tệp
decoded = marshal.loads(encoded)

# Lưu tệp giải mã
with open(output_path, 'wb') as f:
    f.write(decoded)

sys.stdout.write('Giải mã hoàn thành')
  `;
  
  // Chạy script Python giải mã
  exec(`python3 -c "${pythonScript}"`, (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(chatId, `Lỗi giải mã: ${stderr}`);
      return;
    }
    bot.sendMessage(chatId, stdout);
    bot.sendDocument(chatId, `${filePath}.dec`);
    fs.unlinkSync(filePath); // Xóa tệp gốc
  });
}