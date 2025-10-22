"use client"
import React, { useState, useEffect } from 'react'
import Check from './Check';
import { updateLead } from '@/hooks/useLead';

export default function Header({ item, buscar}) {
  const [novaQualidade, setNovaQualidade] = useState();
  const [iaAtiva, setIaAtiva] = useState();

  useEffect(() => {
    if (item) {
      setNovaQualidade(item.qualidade);
      setIaAtiva(item.ia_ativa);
    }
  }, [item])

  useEffect(() => {
    if (item != null) {
      const atualzar = async (a) => {
        await updateLead(a.id, a);
        await buscar();
      }
      const itemAnterior = {... item};
      item.qualidade = novaQualidade;
      item.ia_ativa = iaAtiva;
      console.log(item);
      console.log(itemAnterior);
      
      if (item.qualidade != itemAnterior.qualidade || item.ia_ativa != itemAnterior.ia_ativa) {
        console.log('atualizando');
        atualzar(item);
      }
    }
  }, [novaQualidade, iaAtiva])

  return (
    <div className='w-full flex gap-2 p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 items-center border-b border-neutral-700/50 backdrop-blur-sm shadow-2xl justify-between z-10'>
      <div className='flex flex-col'>
        {item?.numero && <a>Número:</a>}
        <h1>{item?.numero || "Bem-Vindo"}</h1>
      </div>
      {item != null && (
        <div className='flex gap-4'>
          <div className='flex gap-2 items-center justify-center'>
            <h1><strong>IA</strong> Ativa?</h1>
            <Check value={iaAtiva} set={setIaAtiva} />
          </div>
          <select className="min-w-[200px] text-neutral-500 bg-neutral-950 p-3 rounded-md" value={novaQualidade} onChange={(e) => setNovaQualidade(e.target.value)}>
            <option value="fria">Fria ❄️</option>
            <option value="quente">Quente 🔥</option>
            <option value="finalizada">Finalizada 💵</option>
          </select>
        </div>
      )}

    </div>
  )
}
