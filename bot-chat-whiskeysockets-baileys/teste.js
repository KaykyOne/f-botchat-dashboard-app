import makeWASocket from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";

async function startBot() {
    // auth em memória (sempre novo)
    const sock = makeWASocket({ auth: { creds: {}, keys: {} } });

    sock.ev.on('connection.update', update => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("Escaneie este QR:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') console.log('Conectado ao WhatsApp!');
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log('Conexão fechada, reason:', reason);
            // reconectar automaticamente
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message?.conversation) {
            const from = msg.key.remoteJid;
            await sock.sendMessage(from, { text: 'Oi! Recebi sua mensagem.' });
            console.log('Mensagem recebida de', from, '->', msg.message.conversation);
        }
    });
}

startBot();
