import { EmpresaI } from './empresa';
import { NotificacaoI } from './notificacao';

export interface ConviteI {
    id: string;
    email: string;
    empresaId: string;
    empresa: EmpresaI;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    notificacao?: NotificacaoI
}