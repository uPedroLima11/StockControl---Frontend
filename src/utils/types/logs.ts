export interface LogsI {
    id: string;
    usuarioId: string;
    usuario: {
        nome: string;
    };
    empresaId: string; 
    descricao: string;
    tipo: "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO";
    createdAt: Date;
    updatedAt: Date;
}