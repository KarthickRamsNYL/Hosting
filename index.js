const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Use Render-assigned port or fallback to 3000 locally testing
const PORT = process.env.PORT || 3000;

// Setup middleware
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    })
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

// Listen for all messages
client.on('message', async message => {
    const webhookUrl = 'https://smartseasai.app.n8n.cloud/webhook/whatsapp-group';
    
    try {
        const payload = {
            number: message.from,
            message: message.body
        };

        const response = await axios.post(webhookUrl, payload);
        console.log('Message sent to n8n:', response.data);
    } catch (err) {
        console.error('Error sending message to n8n:', err.message);
    }
});

// Health check route (good for Render)
app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running');
});

client.initialize();

// Start Express server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
