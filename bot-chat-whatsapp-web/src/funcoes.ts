import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
const KEY = process.env.KEY
const apiKey = process.env.SUPABASE;
const apiURL = process.env.APIURL;
import fs from 'fs/promises';

const supabase = createClient(apiURL, apiKey);

async function pegarDados(numero) {
  const { data, error } = await supabase
    .from('leads')
    .select('id, historico, num_mensagens, qualidade, ia_ativa')
    .eq('numero', numero);

  if (error) {
    console.log('Erro ao buscar dados do Supabase:', error);
    return null;
  }

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  } else {
    return null;
  }
}

async function pegarLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('numero')
    .not('qualidade', 'eq', 'finalizada')
    .lt('tentativas', 1);

  if (error) {
    console.log('Erro ao buscar dados do Supabase:', error);
    return null;
  }
  if (Array.isArray(data) && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

async function pegarConfigs() {
  const { data, error } = await supabase
    .from('configuracoes')
    .select('configs')
    .eq('id', 1);

  if (error) {
    console.log('Erro ao buscar configurações:', error);
    return null;
  }

  if (data) {
    return data[0]?.configs;
  } else {
    return null;
  }
}

async function atualizarLeadsFrias() {
  // primeiro pega as leads
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, tentativas')
    .lt('tentativas', 1)
    .not('qualidade', 'eq', 'finalizada');

  if (error) {
    console.log('Erro ao buscar leads:', error);
    return null;
  }

  // atualiza cada lead individualmente
  const updates = leads.map(lead => {
    return supabase
      .from('leads')
      .update({
        qualidade: 'fria',
        tentativas: lead.tentativas + 1
      })
      .eq('id', lead.id);
  });

  await Promise.all(updates);

  console.log('Leads frias atualizadas:', leads.length);
  return leads;
}

async function verificarLead(numero, historico) {
  try {
    const data = await pegarDados(numero);
    const countHistorico = historico.filter(item => item.role == 'user').length;
    const historicoCliente = historico.filter(item => item.role == 'user');

    if (data) {
      let nivel = 'fria';
      nivel = await verificarNivel(historicoCliente);

      const { data: updateData, error: errorUpdate } = await supabase
        .from('leads')
        .update({ num_mensagens: countHistorico, historico: historico, qualidade: nivel || 'fria' })
        .eq('id', data.id);

      // console.log('🛠️ UPDATE resultado:', { updateData, errorUpdate });

    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('leads')
        .insert({ numero });

      // console.log('🆕 INSERT resultado:', { insertData, insertError });
    }

  } catch (error) {
    console.log(`❌ ERRO no try/catch: ${error}`);
  }
}

async function verificarNivel(historico) {
  const prompt = `
  Classifique o nível de interesse da lead com base nas mensagens trocadas.
  Níveis possíveis:
  - fria: pouco interesse ou poucas mensagens.
  - quente: interesse claro, conversa ativa.
  - finalizada: SOMENTE se a lead pediu cadastro ou compra.

  Retorne APENAS "fria", "quente" ou "finalizada".
  Se não souber, responda: fria.

  Mensagens:
  ${historico.map(h => `${h.role}: ${h.content}`).join("\n")}
  `;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um classificador de leads.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0
      })
    });

    const json = await res.json();
    const resposta = json.choices[0].message.content.trim().toLowerCase();
    console.log("Classificação:", resposta);
    return resposta;
  } catch (error) {
    console.error(`Erro: ${error}`);
    return 'fria';
  }
}

async function responderPergunta(mensagem, numero) {

  const configs = await pegarConfigs();
  const promptBanco = configs.prompt;
  if (configs.ativo == false) {
    return;
  }

  const numeroCorrigido = numero.split('@');

  const data = await pegarDados(numeroCorrigido[0]);

  if (data) {
    if (data.qualidade == 'finalizada' || (data.historico).length > 20 || data.ia_ativa == false) {
      return;
    };
  }

  let historico = [];
  historico.push({ role: 'system', content: promptBanco });
  if (data && data.historico) {
    historico = [...historico, ...data.historico];
  }

  historico.push({ role: 'user', content: mensagem });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: historico,
      temperature: 0,
      stop: ["Mensagem do usuário:", "Resposta:"]
    })
  });



  const json = await res.json();
  const resposta = json.choices[0].message.content;

  historico.push({ role: 'assistant', content: resposta });
  const historicoFIltrado = historico.filter(item => (item.role == 'user' || item.role == 'assistant'));
  await verificarLead(numeroCorrigido[0], historicoFIltrado);
  return resposta;
}

async function marcarEnviada(id) {
  const { data, error } = await supabase
    .from('mensagens')
    .update({ status: 'enviada' })
    .eq('id', id)

  if (error) console.error('Erro ao atualizar status:', error)
  else console.log('Status atualizado para enviada:', data)
}

async function realtimeSupabase(funct) {
  supabase
    .channel('public:mensagens')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mensagens' },
      (payload) => {
        const data = payload.new

        if (!data || !data.numero) {
          console.error('Payload inválido:', payload)
          return
        }

        const numeroFormatado = data.numero.includes('@c.us')
          ? data.numero
          : `${data.numero}@c.us`

        // console.log('Nova mensagem recebida:', data)

        funct(data.mensagem, numeroFormatado)
        marcarEnviada(data.id);
      }
    )
    .subscribe()
}

async function deleteFolder(folderPath) {
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`Pasta "${folderPath}" apagada com sucesso!`);
  } catch (err) {
    console.error('Erro ao apagar pasta:', err);
  }
}


export { responderPergunta, pegarLeads, atualizarLeadsFrias, realtimeSupabase, deleteFolder };