export interface ClienteI{
    id: string;
    nome: string;
    email?: string | null;
    telefone?: string | null;
    endereco?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
    empresaId: string;
    createdAt: string; 
    updatedAt: string;
}