const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode-terminal');

// Hardcoded values for personal use
const telegramBotToken = '8096816657:AAEIGLl_DoC08As3bW8d8lZjqPDtA-TJXtc';
const telegramChatId = '1786564127';
const aiContact = '34604154472@c.us';

const bot = new TelegramBot(telegramBotToken);

async function sendProgress(msg) {
    try {
        await bot.sendMessage(telegramChatId, `📢 ${msg}`);
    } catch (e) {
        console.error('Telegram Error:', e.message);
    }
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', async (qr) => {
    qrcode.generate(qr, { small: true });
    await bot.sendMessage(telegramChatId, '📲 *Scan the QR to log in to WhatsApp:*', { parse_mode: 'Markdown' });
    await bot.sendPhoto(
        telegramChatId,
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`
    );
});

client.on('ready', () => {
    sendProgress('✅ WhatsApp client is ready and connected.');
});

client.on('authenticated', () => {
    sendProgress('🔐 WhatsApp authenticated successfully.');
});

client.on('auth_failure', (msg) => {
    sendProgress(`❌ WhatsApp auth failure: ${msg}`);
});

client.on('disconnected', (reason) => {
    sendProgress(`⚠️ WhatsApp disconnected: ${reason}`);
});

client.on('message', async (msg) => {
    if (msg.from !== aiContact && msg.body) {
        const chat = await msg.getChat();
        const sender = chat.name || chat.id.user;
        await client.sendMessage(aiContact, `From ${sender}:\n${msg.body}`);
    }
});

client.on('message_create', async (msg) => {
    if (msg.from === aiContact && !msg.fromMe && msg.body) {
        await bot.sendMessage(telegramChatId, `🤖 *AI Replied:*\n${msg.body}`, { parse_mode: 'Markdown' });
    }
});

(async () => {
    try {
        await sendProgress('🚀 Initializing WhatsApp client...');
        await client.initialize();
        await sendProgress('🟢 Initialization complete. Bot running!');
    } catch (err) {
        await sendProgress(`🔥 Initialization failed: ${err.message}`);
        console.error('Bot Startup Error:', err);
    }
})();
