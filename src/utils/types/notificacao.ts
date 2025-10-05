import { ConviteI } from "./convite";

export interface NotificacaoI {
  produtoId: string;
  id: string;
  titulo: string;
  descricao: string;
  lida: boolean;
  somTocado?: boolean;
  empresaId?: string;
  usuarioId?: string;
  conviteId?: string;
  convite?: ConviteI;
  usuario?: {
    id: string;
    nome: string;
  };
  NotificacaoLida: Array<{
    usuarioId: string;
    createdAt: string;
  }>;
  NotificacaoUsuario?: Array<{
    usuarioId: string;
    lida: boolean;
    somTocado: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}