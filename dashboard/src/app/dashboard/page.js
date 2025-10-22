'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { selectAllLeads, updateLead } from '@/hooks/useLead'
import Siderbar from '@/components/Siderbar'
import Header from '@/components/header/Header'
import { insertMensagem } from '@/hooks/useMensagens'
import Modal from '@/components/modal/Modal'

export default function Page() {
  const [leads, setLeads] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [mensagens, setMensagens] = useState([])
  const [lead, setLead] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  // Busca todos os leads ao carregar
  const buscar = async () => {
    const data = await selectAllLeads()
    setLeads(data || [])
  }
  useEffect(() => {
    buscar()
  }, [])
  useEffect(() => {
    const container = document.getElementById('mensagens-container')
    if (container?.scrollHeight > 0) {
      container.scrollTo(0, container.scrollHeight);
    }
  }, [mensagens])
  // Envia mensagem
  const enviarMensagem = async () => {
    if (mensagem.length > 0 && lead) {
      await insertMensagem(mensagem, lead.numero)

      const novaMensagem = { content: mensagem, role: 'assistant' }

      // adiciona ao estado de mensagens de forma segura
      setMensagens(prev => [...prev, novaMensagem])
      setMensagem('')

      // atualiza o histórico do lead sem mutar diretamente
      setLead(prev =>
        prev
          ? { ...prev, historico: [...(prev.historico || []), novaMensagem] }
          : prev
      )

      // opcional: salvar no banco se quiser persistir
      await updateLead(lead.id, { historico: [...lead.historico, novaMensagem] })
      await buscar()
    }
  }
  // Renderiza cada mensagem
  const renderMensagem = (item, index) => {
    return (
      <div
        key={index}
        className={`w-full flex ${item.role === 'user' ? 'justify-start' : 'justify-end'
          }`}
      >
        <div
          className={`rounded-md p-3 pl-5 pr-5 w-fit max-w-[600px] transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:shadow-2xl ${item.role === 'user' ? 'bg-neutral-800' : 'bg-green-800'
            }`}
        >
          <h1>{item.role === 'user' ? 'Cliente' : 'Assistente IA'}</h1>
          {item.content}
        </div>
      </div>
    )
  }
  // Trata digitação e enter
  const handleChange = (e) => {
    const value = e.target.value
    if (value.length <= 100) {
      setMensagem(value)
    } else {
      alert('Mensagem muito grande, máximo 100 caracteres.')
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      enviarMensagem()
    }
  }

  return (
    <div className='flex w-screen h-screen'>
      <Siderbar leads={leads} setMensagens={setMensagens} setLead={setLead} setModalOpen={setModalOpen} />

      <div className='flex flex-col w-full relative items-center'>
        <Header item={lead} buscar={buscar} />

        {/* Área de mensagens */}
        <div className='flex flex-col p-10 gap-3 w-full overflow-y-auto mb-20' id='mensagens-container'>
          {mensagens.map(renderMensagem)}
        </div>

        {/* Campo de envio de mensagem */}
        <div className='absolute flex gap-2 bottom-3 left-0 right-0 p-4 items-center justify-center'>
          <input
            className='input w-[70%]'
            placeholder='Mensagem'
            value={mensagem}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {mensagem.length > 0 && (
            <motion.button
              onClick={enviarMensagem}
              initial={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: -2 }}
              transition={{ delay: 0.1 }}
              className='bg-green-800 items-center justify-center flex w-10 h-10 rounded-lg hover:opacity-80 transition-all duration-300 cursor-pointer'
            >
              <span className='material-symbols-outlined'>send</span>
            </motion.button>
          )}
        </div>
      </div>
      {modalOpen && <Modal setModalOpen={setModalOpen} />}
    </div>
  )
}
