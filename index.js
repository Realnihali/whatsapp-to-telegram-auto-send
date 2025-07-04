const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');
dotenv.config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const aiContact = process.env.AI_CONTACT_NUMBER;

const bot = new TelegramBot(telegramBotToken);

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  bot.sendMessage(telegramChatId, '📲 *Scan this QR code to log in to WhatsApp:*');
  bot.sendPhoto(telegramChatId, `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
});

client.on('ready', () => {
  bot.sendMessage(telegramChatId, '✅ WhatsApp successfully logged in and running!');
});

client.on('message', async (msg) => {
  if (msg.from !== aiContact && msg.body) {
    const chat = await msg.getChat();
    client.sendMessage(aiContact, `From ${chat.name || chat.id.user}:
${msg.body}`);
  }
});

client.on('message_create', async (msg) => {
  if (msg.from === aiContact && !msg.fromMe && msg.body) {
    bot.sendMessage(telegramChatId, `🤖 *AI Reply:*
${msg.body}`, { parse_mode: 'Markdown' });
  }
});

client.initialize();
