import { ProdutoI } from "./produtos";

export interface FornecedorI {
    id: string;
    nome: string;
    cnpj: string;
    telefone: string;
    email: string;
    categoria: string;
    foto?: string;
    empresaId: string;
    usuarioId: string;
    createdAt: string;
    updatedAt: string;
    Produto: ProdutoI[];
}