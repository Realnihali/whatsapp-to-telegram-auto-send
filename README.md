# WhatsApp to Telegram Auto Send Bot 🤖

This is a **public Telegram bot** that allows **any user** to connect their **own WhatsApp Business or Personal account** and automatically forward all incoming **WhatsApp messages** (text, images, documents, etc.) to their **own Telegram chat** privately.

---

🚀 Features

- 📲 Connect your WhatsApp via secure QR code
- 📩 Automatically forwards all WhatsApp text messages
- 🖼️ Media support: images, videos, documents
- 🔐 Each user has their **own private session**
- ☁️ Easily deployable on Railway (free cloud hosting)
- 🧠 No coding knowledge needed for users

---

📸 How It Works

1. Open the Telegram bot and send `/start`
2. Bot generates a **personal QR code**
3. Scan the QR with your WhatsApp (Linked Devices)
4. Once connected, all incoming WhatsApp messages are sent to you on Telegram — live and secure

---

🛠️ Installation Guide (For Developers)

### 1. Clone the Repository

```bash
git clone https://github.com/realnihali/whatsapp-to-telegram-auto-send.git
cd whatsapp-to-telegram-auto-send
````

2. Install Required Node.js Packages

```bash
npm install
```

3. Add Your Telegram Bot Token

Create a file named `.env` in the root folder:


## ☁️ Deploy on Railway (Free Hosting)

1. Go to 👉 [https://railway.app](https://railway.app)
2. Click **"New Project" → "Deploy from GitHub"**
3. Select your repo: `whatsapp-to-telegram-auto-send`
4. Under `Settings → Variables`, add:

```

5. Click "Deploy"
6. View logs → Scan the QR code using WhatsApp Web
7. ✅ You're connected!

---

📦 Folder Structure

```
whatsapp-to-telegram-auto-send/
├── index.js              # Main bot logic
├── package.json          # Node dependencies
├── .env.example          # Example environment config
├── session/              # WhatsApp session data
└── README.md             # Project documentation
```

---

🔐 Security Notes

* All WhatsApp sessions are stored **separately per Telegram user**
* Messages are only forwarded **to the user who linked their WhatsApp**
* No third-party storage or database is used

---

👤 Project Owner

**Name**: Mohd Nihal Haneef
**Phone**: +91 7704860008
**Email**: [mohammadnihal816@gmail.com](mailto:mohammadnihal816@gmail.com)
**GitHub**: [https://github.com/realnihali](https://github.com/realnihali)
**Location**: Uttar Pradesh, India

---

---

❌ No License

This bot is made for personal or private use only.
Redistribution or resale without permission is not allowed.
