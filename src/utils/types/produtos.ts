import { CategoriaI } from "./categoria";
import { FornecedorI } from "./fornecedor";

export interface ProdutoI {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number; 
  quantidadeMin: number;
  foto: string | null;
  noCatalogo: boolean;
  fornecedorId: string | null;
  categoriaId: string | null;
  empresaId: string | null;
  usuarioId: string | null;
  createdAt: Date;
  updatedAt: Date;
  fornecedor?: FornecedorI;
  categoria?: CategoriaI;
  empresa?: string;
}