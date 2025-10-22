// ES Modules
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import express from 'express';
// import qrcode from 'qrcode-terminal';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { responderPergunta, realtimeSupabase } from './funcoes';

const URL = process.env.URL;

const mensagensPendentes = {};
const timeouts = {};
const TEMPO_ESPERA = 2000;

let client;
let qrCode;


// Junta mensagens do mesmo número
function juntarMensagens(numero, texto) {
    mensagensPendentes[numero] = mensagensPendentes[numero]
        ? mensagensPendentes[numero] + '\n' + texto
        : texto;

    if (timeouts[numero]) clearTimeout(timeouts[numero]);
}

// Verifica se o usuário é aluno ou superadm
async function verificarAluno(telefone) {
    const telefoneFinal = telefone.split('@')[0].slice(2);

    try {
        const res = await axios.get(`${URL}/usuario/buscarPorTel`, {
            params: { telefone: telefoneFinal }
        });

        const resultado = res.data.result || [];

        if (!resultado || resultado === 'cliente') return false;

        if (resultado.tipo_usuario === 'aluno') {
            return { mensagem: `E ai tudo bem ${resultado.nome}, no que posso ajudar?`, usuario: resultado };
        } else if (resultado.tipo_usuario === 'superadm') {
            return { mensagem: `As ordens senhor ${resultado.nome}! no que posso ajudar?`, usuario: resultado };
        }

    } catch (err) {
        console.error('Erro ao verificar aluno:', err);
    }

    return false;
}

// Resolve número de LID para contato real
async function resolverNumero(lidId) {
    try {
        const contact = await client.getContactById(lidId);
        if (contact && contact.id) return contact.id._serialized; // ex: '5517997565378@c.us'
    } catch (err) {
        console.error('Erro ao tentar resolver LID:', err);
    }
    return null;
}

// Envia mensagem para número
async function enviarMensagem(texto, numero) {
    await new Promise(r => setTimeout(r, 1500));
    await client.sendMessage(numero, texto);
}

// Inicializa o bot
function startBot() {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', qr => {
        console.log('Aguardando conexão!');
        qrCode = qr;
    });

    client.on('ready', () => console.log('✅ Bot conectado!'));

    client.on('disconnected', reason => {
        console.log('❌ Bot desconectado. Tentando reconectar...', reason);
        setTimeout(startBot, 5000);
    });

    client.on('auth_failure', () => {
        console.log('⚠️ Falha na autenticação. Reiniciando bot...');
        setTimeout(startBot, 5000);
    });

    client.on('message', async msg => {
        try {
            let numero = msg.from;

            if (numero === 'status@broadcast' || numero.endsWith('@g.us')) return;

            if (numero.endsWith('@lid')) {
                const jidReal = await resolverNumero(numero);
                if (jidReal) numero = jidReal;
            }

            const texto = msg.body || '';
            if (msg.fromMe) return;

            const msgTimestamp = Math.floor(msg.timestamp); // timestamp em segundos
            const agora = Math.floor(Date.now() / 1000);
            if (agora - msgTimestamp > 10) return;

            const usuarioAchado = await verificarAluno(numero);
            if (usuarioAchado) return;

            juntarMensagens(numero, texto);

            timeouts[numero] = setTimeout(async () => {
                const mensagens = mensagensPendentes[numero];
                delete mensagensPendentes[numero];
                delete timeouts[numero];

                const res = await responderPergunta(mensagens, numero);
                if (res) await enviarMensagem(res, numero);
            }, TEMPO_ESPERA);

        } catch (err) {
            console.error(err);
        }
    });

    // Conecta ao realtime Supabase
    realtimeSupabase(enviarMensagem);

    client.initialize();
}

export { startBot, qrCode }