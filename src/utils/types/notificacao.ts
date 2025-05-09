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
  enviadoPorId: UsuarioI;
  createdAt: Date;
  updatedAt: Date;
}
