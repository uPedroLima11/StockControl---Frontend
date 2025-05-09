import { CategoriaI } from "./categoria";
import { FornecedorI } from "./fornecedor";

export interface ProdutoI {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidade: number;
    foto?: string;
    fornecedorId?: string;
    categoriaId?: string;
    empresaId?: string;
    fornecedor?: FornecedorI;
    categoria?: CategoriaI;
    empresa?: string;
    createdAt: Date;
    updatedAt: Date;
}