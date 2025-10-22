const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qr = require('qrcode-terminal');
const { NlpManager } = require('node-nlp');
const { responderPergunta, realtimeSupabase } = require('./funcoes');
const axios = require('axios');
// const cron = require('node-cron');
// const fs = require("fs");
require('dotenv').config();

const URL = process.env.URL;

const mensagensPendentes = {};
const timeouts = {};
const TEMPO_ESPERA = 2000;
let sock;

function juntarMensagens(numero, texto) {
    mensagensPendentes[numero] = mensagensPendentes[numero]
        ? mensagensPendentes[numero] + '\n' + texto
        : texto;

    if (timeouts[numero]) clearTimeout(timeouts[numero]);
}
async function verificarAluno(telefone) {
    console.log('telefone q aparece:');
    console.log(telefone);

    let telefoneFormatado = telefone.split('@')
    const telefoneFinal = telefoneFormatado[0].slice(2);

    const res = await axios.get(`${URL}/usuario/buscarPorTel`, {
        params: {
            telefone: telefoneFinal
        }
    });

    console.log();
    let resultado = (res.data.result || [])
    if (resultado == 'cliente') return false;
    else if (resultado.tipo_usuario == 'aluno') {
        return { mensagem: `E ai tudo bem ${resultado.nome}, no que posso ajudar?`, usuario: resultado }
    }
    else if (resultado.tipo_usuario == 'superadm') {
        return { mensagem: `As ordens senhor ${resultado.nome}! no que posso ajudar?`, usuario: resultado }
    }
    console.log('usuario achado');
}
async function resolverNumero(sock, lidId) {
    try {
        const contatos = await sock.onWhatsApp(lidId);
        if (contatos && contatos[0] && contatos[0].jid) {
            return contatos[0].jid; // ex: '5517997565378@s.whatsapp.net'
        }
    } catch (err) {
        console.error('Erro ao tentar resolver LID:', err);
    }
    return null; // não conseguiu resolver
}
async function startBot() {

    //#region CONEXÃO

    const { state, saveCreds } = await useMultiFileAuthState('session');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("messages.update", (updates) => {
        for (const u of updates) {
            console.log("Status de envio:", u.key.id, u.status)
        }
    })

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr: qrCode } = update;

        console.log(qrCode !== undefined)
        if (qrCode) {
            console.log('📸 Escaneie o QR Code para conectar:');
            qr.generate(qrCode, { small: true });
        }

        if (connection === 'open') {
            console.log('✅ Conectado com sucesso!');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Conexão fechada, tentando reconectar...');
            if (shouldReconnect) startBot();
            else console.log('🚫 Erro crítico, não será possível reconectar.');
        }
    });

    //#endregion

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {

            //#region Pegar mensagem
            const msg = messages[0];
            if (!msg.message) return;

            const idRemetente = msg.key.remoteJid;
            let numero = idRemetente;

            if (idRemetente === 'status@broadcast' || idRemetente.endsWith('@g.us')) {
                console.log('Mensagem de status detectada, ignorando...');
                return;
            }

            if (idRemetente.endsWith('@lid')) {
                const jidReal = await resolverNumero(sock, idRemetente);
                if (jidReal) {
                    numeroFinal = jidReal;
                }
            }

            const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

            if (msg.key.fromMe) {
                return
            }

            await sock.sendPresenceUpdate('paused', numero);

            //#endregion

            //#region verificar Tempo
            const msgTimestamp = msg.messageTimestamp?.low || msg.messageTimestamp;
            const agora = Math.floor(Date.now() / 1000); // Timestamp atual em segundos

            // Se a mensagem tiver mais de 10 segundos de diferença, ignora
            if (agora - msgTimestamp > 10) return;
            //#endregion

            const usuarioAchado = await verificarAluno(numero);

            if (usuarioAchado) return;

            juntarMensagens(numero, texto);

            timeouts[numero] = setTimeout(async () => {
                const mensagens = mensagensPendentes[numero];
                delete mensagensPendentes[numero];
                delete timeouts[numero];

                const res = await responderPergunta(mensagens, numero);
                if (res) {
                    await enviarMensagem(res, numero);
                } else {
                    return;
                }
            }, TEMPO_ESPERA);
        } catch (error) {
            console.log(error);
            return;
        }
    });

    realtimeSupabase(enviarMensagem);
}
async function enviarMensagem(texto, numero) {
    await sock.sendPresenceUpdate('composing', numero);
    await new Promise(r => setTimeout(r, 1500));
    await sock.sendMessage(numero, { text: texto });
    await sock.sendPresenceUpdate('paused', numero);
}

startBot();