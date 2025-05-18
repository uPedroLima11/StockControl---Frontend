import { CategoriaI } from "./categoria";
import { FornecedorI } from "./fornecedor";

export interface ProdutoI {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidade: number;
    quantidadeMin: number;
    foto?: string;
    fornecedorId?: string;
    categoriaId?: string;
    empresaId?: string;
    fornecedor?: FornecedorI;
    categoria?: CategoriaI;
    empresa?: string;
    usuarioId?: string;
    createdAt: Date;
    updatedAt: Date;
}