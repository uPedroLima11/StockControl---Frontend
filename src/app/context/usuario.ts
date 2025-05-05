import { UsuarioI } from "@/utils/types/usuario";
import { create } from "zustand";

type UsuarioStore = {
  usuario: UsuarioI;
  logar: (usuario: UsuarioI) => void;
  deslogar: () => void;
};

export const useUsuarioStore = create<UsuarioStore>((set) => ({
  usuario: {} as UsuarioI,
  logar: (usuarioLogado) => set({ usuario: usuarioLogado }),
  deslogar: () => set({ usuario: {} as UsuarioI }),
}));
