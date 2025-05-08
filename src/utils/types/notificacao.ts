import { ConviteI } from "./convite";

export interface NotificacaoI {
  id: number;
  titulo: string;
  descricao: string;
  lida: boolean;
  usuarioId: number;
  convite: ConviteI
  createdAt: Date;
  updatedAt: Date;
}
