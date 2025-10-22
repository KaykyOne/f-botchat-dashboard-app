"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { login } from '@/hooks/useLogin'
import { toast, ToastContainer } from 'react-toastify'

export default function Page() {


  const router = useRouter()
  const [loading, setLoading] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleClick() {
    if (!email || !password) {
      toast.error('Preencha todos os campos!');
      return;
    }
    try {
      setLoading(true);
      const user = await login(email, password);
      if (!user) {
        toast.error('Usuário ou senha incorretos!');
        setLoading(false);
        return;
      } else {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      toast.error('Erro ao fazer login!');
      console.log(error);
      setLoading(false);
    }

  }


  return (
    <div className='flex lg:overflow-hidden items-center justify-center w-screen h-screen'>
      <div className='flex flex-col flex-1 justify-center items-center p-10 w-full h-full gap-5 aparecer max-w-[600px]'>
        <div className='w-full text-center mb-5'>
          <h1 className='text-5xl lg:text-7xl font-bold'>Bem-Vindo</h1>
          <p>Gerenciamento de Leads da NovusTech</p>
        </div>
        <input className="input" placeholder="Email" type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className='w-full flex gap-2'>
          <input
            className="input"
            placeholder="Senha"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className='flex justify-center items-center cursor-pointer px-4 rounded'
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            type="button"
          >
            <span className="material-symbols-outlined">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <button className='button group' onClick={handleClick} disabled={loading}>
          {!loading ? (
            <>
              Acessar
              < span className="material-symbols-outlined !text-2xl">
                play_arrow
              </span>
            </>
          ) : (
            <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"></div>
          )}

        </button>
        <div className='transition duration-600 rounded-2xl p-2 group'>
          <a className='cursor-pointer'>Esqueceu a senha? clique aqui!</a>
          <div className='w-0 h-1 group-hover:w-full bg-primary transition-all duration-300 rounded-full'></div>
        </div>
      </div>
      <ToastContainer
        limit={1}
        closeOnClick={true}
        theme='colored' />
    </div >
  )
}
