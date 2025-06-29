const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const bot = new TelegramBot('8096816657:AAG1Tku6eyN533a0jrVzSnEiv0HxvvaT3Vg', { polling: true });

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
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });

    client.on('qr', async qr => {
        const qrImagePath = `./session/qr-${chatId}.png`;
        await qrcode.toFile(qrImagePath, qr);
        await bot.sendPhoto(chatId, qrImagePath, { caption: "📲 Scan this QR with your WhatsApp Business/Personal to link." });
        fs.unlinkSync(qrImagePath);
    });

    client.on('ready', () => {
        bot.sendMessage(chatId, "✅ Your WhatsApp is now connected! All new messages will be forwarded here.");
    });

    client.on('message', async message => {
        if (message.fromMe) return; // Don't forward your own replies
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            const ext = media.mimetype.split('/')[1];
            const filename = `media-${chatId}.${ext}`;
            fs.writeFileSync(filename, media.data, 'base64');

            await bot.sendDocument(chatId, filename, {}, { caption: message.body || '' });
            fs.unlinkSync(filename);
        } else {
            await bot.sendMessage(chatId, `📨 New WhatsApp Message:\n${message.body}`);
        }
    });

    client.initialize();
    sessions[chatId] = client;
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "👋 Welcome to *WhatsApp Forwarder Bot*!\n\nPlease wait while we generate your QR...");
    await startWhatsAppForUser(chatId);
});
