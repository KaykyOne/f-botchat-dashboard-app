"use client"
const apiKey = process.env.NEXT_PUBLIC_SUPABASE;
const apiURL = process.env.NEXT_PUBLIC_APIURL;
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(apiURL, apiKey)

async function insertMensagem(mensagem, numero) {

    const { data, error } = await supabase
        .from('mensagens')
        .insert([
            { mensagem: mensagem, numero: numero }
        ])

    if (error) {
        console.error(error)
        return []
    }
    return data
}

export { insertMensagem };
