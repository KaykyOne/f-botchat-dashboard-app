'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';

export default function Siderbar({ leads, setMensagens, setLead, setModalOpen }) {
  const [filtro, setFiltro] = useState(0);
  const [filtroNumero, setFiltroNumero] = useState('');

  const defaultcss = 'rounded-md p-1 pl-2 pr-2 text-[10px] capitalize font-bold flex itens-center gap-1 juscetify-center';

  const css = {
    fria: {
      css: 'bg-blue-800 ' + defaultcss,
      icone: 'mode_cool',
    },
    quente: {
      css: 'bg-amber-800 ' + defaultcss,
      icone: 'local_fire_department',
    },
    finalizada: {
      css: 'bg-green-800 ' + defaultcss,
      icone: 'check'
    }
  }

  const filtros = ['todos', 'fria', 'quente', 'finalizada']

  const renderMensagem = (item, index) => {
    const historicoFiltrado = (item.historico).filter(item => item.role == 'user');
    const ultimaMensagem = historicoFiltrado[historicoFiltrado.length - 1];
    const mensagem = ultimaMensagem?.content;

    return (
      <motion.div
        className='flex gap-2 w-full p-2 rounded-md text-white hover:ml-2 transition-all duration-300 cursor-pointer hover:bg-neutral-900 items-start justify-start'
        key={item.id}
        onClick={() => { setMensagens(item.historico); setLead(item) }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}>
        <span className="material-symbols-outlined text-neutral-600 !text-3xl">
          account_circle
        </span>
        <div className='flex flex-col'>
          <div className='flex gap-2'>
            <h1>{item.numero}</h1>
            <div className={css[item.qualidade].css}>
              {item.qualidade}
              <span className="material-symbols-outlined !text-[14px]">
                {css[item.qualidade].icone}
              </span>
            </div>
            {item.ia_ativa && (
              <div className="bg-purple-50-500 text-white text-[10px] font-medium px-2 py-1 rounded w-fit">
                IA
              </div>
            )}

          </div>
          <p>{mensagem?.length > 100 ? mensagem.slice(0, 50) + "..." : mensagem}</p>
        </div>
      </motion.div>
    )
  }

  let leadsFiltradas = [];
  leadsFiltradas = filtro != 0 ? leads?.filter(item => item.qualidade == filtros[filtro]) : leads;
  leadsFiltradas = filtroNumero != '' ? leadsFiltradas.filter(item => (item.numero).includes(filtroNumero)) : leadsFiltradas;

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: '100%' }}
      transition={{ delay: 1 * 0.1 }}
      className='flex flex-col gap-2 bg-background max-w-[400px] h-full p-6 shadow-2xl'>
      <div className='flex gap-2 w-full h-fit items-center text-center opacity-55 justify-between'>
        <h1 className='text-xl'>NovusTech</h1>
        <div className='flex gap-5 justify-center items-center'>
          <button className='hover:scale-110 transition-all duration-300 cursor-pointer'>
            <span className="material-symbols-outlined">
              chat
            </span>
          </button>

          <details className='relative group'>
            <summary className='cursor-pointer hover:scale-110 transition-all duration-300 z-50'>
              <span className="material-symbols-outlined">
                more_vert
              </span>
            </summary>
            <ul className='absolute right-0 top-full bg-neutral-800 !bg-opacity-100 p-2 rounded-md flex flex-col gap-2 mt-2 shadow-lg z-50' onClick={() => setModalOpen(true)}>
              <li className='hover:bg-neutral-700 flex gap-2 transition-all duration-300 cursor-pointer px-3 py-1 rounded text-start'>
                <span className="material-symbols-outlined">
                  settings
                </span>
                Configurações
              </li>
              <li className='hover:bg-neutral-700 flex gap-2 transition-all duration-300 cursor-pointer px-3 py-1 rounded text-start'>
                <span className="material-symbols-outlined">
                  help
                </span>
                Ajuda
              </li>
            </ul>
          </details>
        </div>
      </div>

      <div className='mt-5 flex flex-col gap-4'>

        <input
          className=" input"
          name="text"
          placeholder="Pesquisar por número (somente numero)"
          type="number"
          value={filtroNumero}
          onChange={(e) => setFiltroNumero(e.target.value)}
        />


        <details className="flex flex-col gap-4 opacity-70 has-hover:opacity-100 transition-all duration-300 cursor-pointer text-neutral-500">
          <summary>Filtros</summary>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              onClick={() => setFiltro(0)}
              className="flex items-center gap-2 p-2 rounded-lg bg-neutral-700 text-neutral-400 hover:bg-neutral-100 shadow-sm transition cursor-pointer w-full"
            >
              Todas
              <span className="material-symbols-outlined text-neutral-400">
                clear_all
              </span>
            </button>

            <button
              onClick={() => setFiltro(1)}
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-950 text-blue-400 hover:bg-blue-800 shadow-sm transition cursor-pointer w-full"
            >
              Frias
              <span className="material-symbols-outlined text-blue-400">
                ac_unit
              </span>
            </button>

            <button
              onClick={() => setFiltro(2)}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-900 text-amber-400 hover:bg-amber-700 shadow-sm transition cursor-pointer w-full"
            >
              Quentes
              <span className="material-symbols-outlined text-amber-400">
                local_fire_department
              </span>
            </button>

            <button
              onClick={() => setFiltro(3)}
              className="flex items-center gap-2 p-2 rounded-lg bg-green-900 text-green-400 hover:bg-green-300 shadow-sm transition cursor-pointer w-full"
            >
              Finalizadas
              <span className="material-symbols-outlined text-green-400">
                check_circle
              </span>
            </button>
          </div>
        </details>

      </div>


      <div className='flex flex-col gap-1 mt-5 overflow-hidden overflow-y-auto no-scrollbar'>
        {Object.values(leadsFiltradas).map((item, index) =>
          (renderMensagem(item, index))
        )}
      </div>
    </motion.div>
  )
}
