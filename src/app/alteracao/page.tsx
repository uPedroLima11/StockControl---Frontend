"use client";
import { HiEnvelope, HiLockClosed, HiMiniIdentification, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Link from "next/link";

type Inputs = {
  email: string;
  codigoVerificacao: string;
  senha: string;
  confirmaSenha: string;
};

export default function Alteracao() {
  const { register, handleSubmit, control } = useForm<Inputs>();
  const router = useRouter();
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const senha = useWatch({ control, name: "senha" });
  const confirmaSenha = useWatch({ control, name: "confirmaSenha" });

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
    setPasswordValid(validarSenha(senha));
    setPasswordsMatch(senha === confirmaSenha && senha !== '');
  }, [senha, confirmaSenha]);

  async function verificaAlteracao(data: Inputs) {
    try {
      if (!passwordValid) {
        Swal.fire({
          icon: "error",
          title: "Senha inválida",
          text: "A senha deve conter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }
      if (data.senha !== data.confirmaSenha) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "As senhas não coincidem.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/recuperacao/alterar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
          recuperacao: data.codigoVerificacao,
        }),
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Senha alterada com sucesso!",
          text: "Você pode acessar sua conta com a nova senha.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        }).then(() => {
          router.push("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Ocorreu um erro ao alterar a senha. Tente novamente.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Ocorreu um erro ao alterar a senha. Tente novamente.",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    }
  }

  return (
    <div 
      className="flex justify-center items-center flex-col gap-5 min-h-screen w-full px-4 py-8"
      style={{ backgroundColor: temaAtual.fundo }}
    >
      <div className="w-full flex justify-center">
        <Link 
          href={"/"} 
          className="p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: temaAtual.card }}
        >
          <img src="/icone.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 mb-2 brightness-0 invert" />
          <span 
            className="text-center text-xl md:text-2xl font-semibold whitespace-nowrap"
            style={{ color: temaAtual.texto }}
          >
            StockControl
          </span>
        </Link>
      </div>
      
      <form 
        onSubmit={handleSubmit(verificaAlteracao)} 
        className="w-full max-w-md rounded-xl shadow-lg p-6 md:p-8"
        style={{ backgroundColor: temaAtual.card }}
      >
        <h2 
          className="text-xl md:text-2xl font-semibold mb-6 text-center"
          style={{ color: temaAtual.texto }}
        >
          Alterar senha
        </h2>

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          E-mail cadastrado
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope style={{ color: temaAtual.placeholder }} />
          </div>
          <input 
            type="email" 
            {...register("email")} 
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Digite seu e-mail" 
            required 
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Código de verificação
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed style={{ color: temaAtual.placeholder }} />
          </div>
          <input 
            type="text" 
            {...register("codigoVerificacao")} 
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Digite o código de verificação" 
            required 
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Nova senha
        </label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification style={{ color: temaAtual.placeholder }} />
          </div>
          <input 
            type={showPassword ? "text" : "password"} 
            {...register("senha")} 
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Digite a nova senha" 
            required 
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
          <div 
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEyeSlash style={{ color: temaAtual.placeholder }} />
            ) : (
              <FaEye style={{ color: temaAtual.placeholder }} />
            )}
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
          Confirme a nova senha
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification style={{ color: temaAtual.placeholder }} />
          </div>
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            {...register("confirmaSenha")} 
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Confirme a nova senha" 
            required 
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
          <div 
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <FaEyeSlash style={{ color: temaAtual.placeholder }} />
            ) : (
              <FaEye style={{ color: temaAtual.placeholder }} />
            )}
          </div>
          {confirmaSenha && (
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
          <ul className="text-xs md:text-sm list-disc pl-5 mt-2" style={{ color: temaAtual.placeholder }}>
            <li className={senha?.length >= 8 ? "text-green-500" : "text-red-500"}>No mínimo 8 caracteres</li>
            <li className={senha && /[a-z]/.test(senha) ? "text-green-500" : "text-red-500"}>Letra minúscula</li>
            <li className={senha && /[A-Z]/.test(senha) ? "text-green-500" : "text-red-500"}>Letra maiúscula</li>
            <li className={senha && /[0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>Número</li>
            <li className={senha && /[^a-zA-Z0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>Símbolo</li>
          </ul>
        </div>

        <button 
          type="submit" 
          className="text-white cursor-pointer font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center text-sm md:text-base transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: temaAtual.primario }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Alterar senha
        </button>

        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="text-sm md:text-base hover:opacity-80 cursor-pointer transition-all"
            style={{ color: temaAtual.texto }}
          >
            Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  );
}
