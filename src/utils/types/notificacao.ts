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
  usuarioId: string;  
  usuario?: UsuarioI;
  convite: ConviteI | null;
  createdAt: Date;
  updatedAt: Date;
}
