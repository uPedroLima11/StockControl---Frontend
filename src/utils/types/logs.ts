export interface LogsI {
    id: string;
    descricao: string;
    tipo: "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO";
    createdAt: Date;
    updatedAt: Date;
}