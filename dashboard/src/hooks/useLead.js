"use client"
const apiKey = process.env.NEXT_PUBLIC_SUPABASE;
const apiURL = process.env.NEXT_PUBLIC_APIURL;
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(apiURL, apiKey)

async function selectAllLeads() {
    const { data, error } = await supabase
        .from('leads')
        .select('*')

    if (error) {
        console.error(error)
        return []
    }
    return data
}


async function updateLead(id, lead) {
    const { data, error } = await supabase
        .from('leads')
        .update(lead)
        .eq('id', id)

    if (error) {
        console.error(error)
        return []
    }
    return data
}

async function deleteLead(id) {
    const { data, error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error(error)
        return []
    }
    return data
}

export { selectAllLeads, updateLead, deleteLead };
