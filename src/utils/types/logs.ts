export interface LogsI {
    id: string;
    usuarioId: string;
    usuario: {
        nome: string;
    };
    empresaId: string; 
    descricao: string;
    tipo: "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO" | "BAIXA" | "EMAIL_ENVIADO";
    createdAt: Date;
    updatedAt: Date;
}