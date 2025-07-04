// Full Railway-compatible code to login WhatsApp, receive AI replies, and send them to Telegram

const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');
dotenv.config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const aiContact = process.env.AI_CONTACT_NUMBER;

const bot = new TelegramBot(telegramBotToken);

// Initialize WhatsApp client with non-headless fallback for Railway
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // For Railway compatibility
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
    executablePath: '/usr/bin/google-chrome-stable' // You must ensure this path exists on Railway
  },
});

// Send QR code as image to Telegram for login
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  bot.sendMessage(telegramChatId, '📲 *Scan this QR code to log in to WhatsApp:*');
  bot.sendPhoto(
    telegramChatId,
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`
  );
});

// Notify when WhatsApp is ready
client.on('ready', () => {
  bot.sendMessage(telegramChatId, '✅ WhatsApp successfully logged in and running!');
});

// Forward incoming messages (not from AI) to AI
client.on('message', async (msg) => {
  if (msg.from !== aiContact && msg.body) {
    const chat = await msg.getChat();
    const sender = chat.name || chat.id.user;
    client.sendMessage(aiContact, `From ${sender}:
${msg.body}`);
  }
});

// Forward AI replies to Telegram
client.on('message_create', async (msg) => {
  if (msg.from === aiContact && !msg.fromMe && msg.body) {
    bot.sendMessage(telegramChatId, `🤖 *AI Reply:*
${msg.body}`, { parse_mode: 'Markdown' });
  }
});

client.initialize();
