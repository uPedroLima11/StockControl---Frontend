import { ConviteI } from "./convite";

export interface UsuarioI {
  id: string;
  nome: string;
}

export interface NotificacaoI {
  id: string;
  titulo: string;
  descricao: string;
  lida: boolean;
  empresaId: string | null;
  empresa?: UsuarioI;
  usuarioId: string | null;  
  usuario?: UsuarioI;
  convite: ConviteI | null;
  createdAt: Date;
  updatedAt: Date;
  NotificacaoLida?: {
    notificacaoId: string;
    usuarioId: string;
    createdAt: Date;
  }[];
}