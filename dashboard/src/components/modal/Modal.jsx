'use client'

import React, { useEffect, useState } from 'react'
import { buscarConfiguracoes, atualizarConfiguracoes } from '@/hooks/useConfiguracoes'

export default function Modal({ setModalOpen }) {

    const [configuracoes, setConfiguracoes] = useState({});

    async function getQrCode() {

    }

    async function desconectar() {

    }

    async function buscar() {
        const data = await buscarConfiguracoes();
        console.log(data);
        if (data) {
            setConfiguracoes(data.configs);
        }
    }

    useEffect(() => {
        buscar();
    }, []);

    const renderConfig = (key, value) => {
        return (
            <div key={key} className='flex flex-col gap-2'>
                <label className='font-medium capitalize'>{key}</label>
                {value.length < 10 ? (
                    <input
                        type='text'
                        value={value}
                        onChange={(e) => setConfiguracoes({ ...configuracoes, [key]: e.target.value })}
                        className='input'
                    />
                )
                    : (
                        <textarea
                            type='text'
                            value={value}
                            onChange={(e) => setConfiguracoes({ ...configuracoes, [key]: e.target.value })}
                            className='input overflow-y-auto'
                            rows={value.length / 43 || 2}
                        />
                    )}

            </div>
        )
    }

    const saveConfigs = async () => {
        console.log('salvando!');
        await atualizarConfiguracoes(configuracoes);
        console.log(configuracoes);
        await buscar();
    }

    return (
        <div className='grid grid-cols-5'>
            <div className='fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-[1000]'>
                <div className='bg-background rounded-2xl border-2 border-neutral-800 shadow-md items-center justify-start w-1/2 h-1/2 overflow-y-auto flex flex-col p-5'>
                    <div className='w-full flex flex-col justify-end items-end gap-3'>
                        <button onClick={() => setModalOpen(false)} className='text-xl font-medium cursor-pointer transition-all duration-200 hover:text-red-500'>X</button>
                    </div>
                    <h1 className='text-4xl'>Configurações:</h1>
                    <div className='flex flex-col gap-4 mt-5 h-fit w-3/4'>
                        {configuracoes != null && Object.keys(configuracoes).length > 0 && Object.entries(configuracoes).map(([key, value]) => renderConfig(key, value))}
                    </div>
                    <div className='flex w-full justify-center items-center mt-5'>
                        <button className='button w-full' onClick={() => saveConfigs()}>Salvar</button>
                    </div>
                </div>
            </div>
        </div>

    )
}
