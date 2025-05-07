import { ProdutoI } from "./produtos";

export interface FornecedorI {
    id: string;
    nome: string;
    cnpj: string;
    telefone: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    Produto: ProdutoI[];
}