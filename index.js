// Full working code with puppeteer (not puppeteer-core) for Railway compatibility

const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

// Direct token, chat ID, and WhatsApp AI contact
const telegramBotToken = '8096816657:AAEIGLl_DoC08As3bW8d8lZjqPDtA-TJXtc';
const telegramChatId = '1786564127';
const aiContact = '34604154472@c.us';

const bot = new TelegramBot(telegramBotToken);

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        executablePath: puppeteer.executablePath()
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    bot.sendMessage(telegramChatId, '📲 *Scan this QR code to log in to WhatsApp:*');
    bot.sendPhoto(
        telegramChatId,
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`
    );
});

client.on('ready', () => {
    bot.sendMessage(telegramChatId, '✅ WhatsApp successfully logged in and running!');
});

client.on('message', async (msg) => {
    if (msg.from !== aiContact && msg.body) {
        const chat = await msg.getChat();
        const sender = chat.name || chat.id.user;
        client.sendMessage(aiContact, `From ${sender}:
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
