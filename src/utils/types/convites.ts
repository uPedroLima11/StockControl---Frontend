export interface Convite {
    id: string; 
    email: string; 
    empresaId: string; 
    empresa: Empresa; 
    status: StatusConvite;
    createdAt: Date; 
    updatedAt: Date;
    notificacao?: Notificacao; 
}

export interface Empresa {
    id: string;
    nome: string;
}

export enum StatusConvite {
    PENDENTE = "PENDENTE",
    ACEITO = "ACEITO",
    RECUSADO = "RECUSADO",
}

export interface Notificacao {
    id: string;
    mensagem: string;
}