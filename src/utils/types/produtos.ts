export interface ProdutoI {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidade: number;
    foto?: string;
    fornecedorId?: string;
    categoriaId?: string;
    createdAt: Date;
    updatedAt: Date;
}