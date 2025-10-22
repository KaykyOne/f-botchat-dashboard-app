const apiKey = process.env.NEXT_PUBLIC_SUPABASE;
const apiURL = process.env.NEXT_PUBLIC_APIURL;
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(apiURL, apiKey)

async function atualizarConfiguracoes(configuracoes) {
    const { data, error } = await supabase
        .from('configuracoes')
        .update({ configs: configuracoes })
        .eq('id', 1)

    if (error) {
        console.error(error);
        return null;
    }
    
    return;
}

async function buscarConfiguracoes() {
    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', 1)
        .single()

    if (error) {
        console.error(error);
        return null;
    }
    return data
}
export { atualizarConfiguracoes, buscarConfiguracoes };