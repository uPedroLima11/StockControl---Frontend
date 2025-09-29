"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { HiEnvelope, HiLockClosed, HiMiniUserCircle, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";

type Inputs = {
  nome: string;
  email: string;
  senha: string;
  verificarSenha: string;
};

type EmailStatus = {
  existe: boolean;
  carregando: boolean;
  mensagem: string;
};

export default function Registro() {
  const { register, handleSubmit, control } = useForm<Inputs>();
  const router = useRouter();
  const [visivel, setVisivel] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const senha = useWatch({ control, name: "senha" });
  const verificarSenha = useWatch({ control, name: "verificarSenha" });
  const email = useWatch({ control, name: "email" });

  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    existe: false,
    carregando: false,
    mensagem: ""
  });


  const temaAtual = cores.dark;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html::-webkit-scrollbar {
        width: 10px;
      }
      
      html::-webkit-scrollbar-track {
        background: ${temaAtual.card};
      }
      
      html::-webkit-scrollbar-thumb {
        background: ${temaAtual.borda}; 
        border-radius: 5px;
        border: 2px solid ${temaAtual.card};
      }
      
      html::-webkit-scrollbar-thumb:hover {
        background: ${temaAtual.primario}; 
      }
      
      html {
        scrollbar-width: thin;
        scrollbar-color: ${temaAtual.borda} ${temaAtual.card};
      }
      
      @media (max-width: 768px) {
        html::-webkit-scrollbar {
          width: 6px;
        }
        
        html::-webkit-scrollbar-thumb {
          border: 1px solid ${temaAtual.card};
          border-radius: 3px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [temaAtual]);

  function validarSenha(senha: string) {
    if (!senha) return false;
    if (senha.length < 8) return false;
    let minusculas = 0, maiusculas = 0, numeros = 0, simbolos = 0;
    for (const char of senha) {
      if (/[a-z]/.test(char)) minusculas++;
      else if (/[A-Z]/.test(char)) maiusculas++;
      else if (/[0-9]/.test(char)) numeros++;
      else simbolos++;
    }
    return minusculas > 0 && maiusculas > 0 && numeros > 0 && simbolos > 0;
  }

  useEffect(() => {
    const verificarEmailDisponibilidade = async () => {
      if (!email) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: ""
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: ""
        });
        return;
      }

      setEmailStatus(prev => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-email/${encodeURIComponent(email)}`
        );

        if (response.ok) {
          const data = await response.json();
          setEmailStatus({
            existe: data.existe,
            carregando: false,
            mensagem: data.mensagem
          });
        } else {
          setEmailStatus({
            existe: false,
            carregando: false,
            mensagem: "Erro ao verificar email"
          });
        }
      } catch {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: "Erro ao verificar email"
        });
      }
    };

    const timeoutId = setTimeout(verificarEmailDisponibilidade, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  useEffect(() => {
    setPasswordValid(validarSenha(senha));
    setPasswordsMatch(senha === verificarSenha && senha !== '');
  }, [senha, verificarSenha]);

  async function verificaCadastro(data: Inputs) {
    try {
      if (emailStatus.existe) {
        Swal.fire({
          icon: "error",
          title: "Email já cadastrado",
          text: emailStatus.mensagem,
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }

      if (!passwordValid) {
        Swal.fire({
          icon: "error",
          title: "Senha inválida",
          text: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }

      if (data.senha !== data.verificarSenha) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "As senhas não coincidem.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          tipo: "FUNCIONARIO",
        }),
      });

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Cadastro realizado!",
          text: "Sua conta foi criada com sucesso.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        }).then(() => {
          router.push("/login");
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Algo deu errado.",
          text: errorData.mensagem || "Verifique se o email já está cadastrado ou se a senha atende todos os requisitos.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível conectar ao servidor. Tente novamente.",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    }
  }

  return (
    <div 
      className="flex justify-center items-center flex-col gap-5 min-h-screen w-full px-2 py-4"
      style={{ backgroundColor: temaAtual.fundo }}
    >
      <div className="mt-2 w-full flex justify-center">
        <Link
          href="/"
          className="px-6 py-6 md:px-8 md:py-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: temaAtual.card }}
        >
          <img src="/icone.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 mb-2 brightness-0 invert" />
          <span 
            className="p-0 pr-2 text-xl md:text-2xl font-semibold whitespace-nowrap"
            style={{ color: temaAtual.texto }}
          >
            StockControl
          </span>
        </Link>
      </div>

      <form
        className="w-full max-w-md md:max-w-lg lg:max-w-xl rounded-xl shadow-lg p-4 md:p-8 mx-auto"
        onSubmit={handleSubmit(verificaCadastro)}
        style={{ backgroundColor: temaAtual.card }}
      >
        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Seu Nome:
        </label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniUserCircle style={{ color: temaAtual.placeholder }} />
          </div>
          <input
            type="text"
            maxLength={20}
            {...register("nome")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
            placeholder="Seu nome completo"
          />
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Seu Email:
        </label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope style={{ color: temaAtual.placeholder }} />
          </div>
          <input
            type="email"
            {...register("email")}
            required
            className={`border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
              emailStatus.existe ? 'border-red-500' : 
              email && !emailStatus.existe && !emailStatus.carregando ? 'border-green-500' : 
              'border-gray-600'
            }`}
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto
            }}
            placeholder="seu@email.com"
          />
          
          {email && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5">
              {emailStatus.carregando ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: temaAtual.primario }}></div>
              ) : emailStatus.existe ? (
                <FaTimes style={{ color: temaAtual.erro }} />
              ) : (
                <FaCheck style={{ color: temaAtual.sucesso }} />
              )}
            </div>
          )}
        </div>

        {emailStatus.mensagem && (
          <div 
            className={`text-xs mb-3 p-2 rounded border ${
              emailStatus.existe ? 'bg-red-900/20 text-red-400 border-red-800' : 
              'bg-green-900/20 text-green-400 border-green-800'
            }`}
          >
            {emailStatus.mensagem}
          </div>
        )}

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Sua Senha:
        </label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed style={{ color: temaAtual.placeholder }} />
          </div>
          <input
            placeholder="mínimo 8 caractéres, Maiusculas, minusculas e simbolos"
            type={visivel ? "text" : "password"}
            {...register("senha")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
          <div
            className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5"
            onClick={() => setVisivel(!visivel)}
          >
            {visivel ? 
              <FaEyeSlash style={{ color: temaAtual.placeholder }} /> : 
              <FaEye style={{ color: temaAtual.placeholder }} />
            }
          </div>
          {senha && (
            <div className="absolute inset-y-0 end-10 flex items-center pe-3.5">
              {passwordValid ? (
                <HiCheckCircle style={{ color: temaAtual.sucesso }} />
              ) : (
                <HiExclamationCircle style={{ color: temaAtual.erro }} />
              )}
            </div>
          )}
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Confirmar Senha:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed style={{ color: temaAtual.placeholder }} />
          </div>
          <input
            placeholder="Digite a senha novamente"
            type={visivel ? "text" : "password"}
            {...register("verificarSenha")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
          <div
            className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5"
            onClick={() => setVisivel(!visivel)}
          >
            {visivel ? 
              <FaEyeSlash style={{ color: temaAtual.placeholder }} /> : 
              <FaEye style={{ color: temaAtual.placeholder }} />
            }
          </div>
          {verificarSenha && (
            <div className="absolute inset-y-0 end-10 flex items-center pe-3.5">
              {passwordsMatch ? (
                <HiCheckCircle style={{ color: temaAtual.sucesso }} />
              ) : (
                <HiExclamationCircle style={{ color: temaAtual.erro }} />
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm md:text-base" style={{ color: temaAtual.placeholder }}>
            A senha deve conter:
          </p>
          <ul className="text-xs md:text-sm list-disc pl-5" style={{ color: temaAtual.placeholder }}>
            <li className={senha?.length >= 8 ? "text-green-500" : "text-red-500"}>Mínimo 8 caracteres</li>
            <li className={senha && /[a-z]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 letra minúscula</li>
            <li className={senha && /[A-Z]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 letra maiúscula</li>
            <li className={senha && /[0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 número</li>
            <li className={senha && /[^a-zA-Z0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 símbolo</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={emailStatus.existe || emailStatus.carregando}
          className="text-white cursor-pointer font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: temaAtual.primario }}
          onMouseEnter={(e) => {
            if (!emailStatus.existe && !emailStatus.carregando) {
              e.currentTarget.style.opacity = "0.9";
            }
          }}
          onMouseLeave={(e) => {
            if (!emailStatus.existe && !emailStatus.carregando) {
              e.currentTarget.style.opacity = "1";
            }
          }}
        >
          {emailStatus.carregando ? "Verificando..." : "Registrar-se"}
        </button>

        <div className="flex justify-between pt-5">
          <Link 
            href="/login" 
            className="font-italic hover:opacity-80 text-sm md:text-base cursor-pointer transition-all"
            style={{ color: temaAtual.texto }}
          >
            já possuo login
          </Link>
        </div>
      </form>
    </div>
  );
}