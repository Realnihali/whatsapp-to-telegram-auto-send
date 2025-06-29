const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');

const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8096816657:AAEIGLl_DoC08As3bW8d8lZjqPDtA-TJXtc';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const sessions = {};

const startWhatsAppForUser = async (chatId) => {
    if (sessions[chatId]) return;

    const sessionDir = path.join(__dirname, 'session', String(chatId));
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: String(chatId),
            dataPath: './session',
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
            ]
        }
    });

    client.on('qr', async qr => {
        const buffer = await qrcode.toBuffer(qr);
        await bot.sendPhoto(chatId, buffer, { caption: "📲 Scan this QR with your WhatsApp to link." });
        console.log("✅ QR sent to Telegram via buffer!");
    });

    client.on('ready', () => {
        bot.sendMessage(chatId, "✅ WhatsApp is now connected. Messages will be forwarded here.");
    });

    client.on('auth_failure', msg => {
        console.error('❌ AUTH FAILED:', msg);
        bot.sendMessage(chatId, "❌ WhatsApp auth failed. Try /start again.");
    });

    client.on('message', async message => {
        if (message.fromMe) return;

        if (message.hasMedia) {
            const media = await message.downloadMedia();
            const ext = media.mimetype.split('/')[1];
            const filename = `media-${chatId}.${ext}`;
            fs.writeFileSync(filename, media.data, 'base64');
            await bot.sendDocument(chatId, filename, {}, { caption: message.body || '' });
            fs.unlinkSync(filename);
        } else {
            await bot.sendMessage(chatId, `📨 WhatsApp Message:
${message.body}`);
        }
    });

    client.initialize();
    sessions[chatId] = client;
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "👋 Welcome! Generating QR to link your WhatsApp...");
    await startWhatsAppForUser(chatId);
});