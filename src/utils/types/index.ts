export interface Tema {
  fundo: string;
  texto: string;
  card: string;
  borda: string;
  primario: string;
  secundario: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  email: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  fornecedorId: string;
  foto?: string;
  fornecedor?: {
    id: string;
    nome: string;
  };
}

export interface ItemPedido {
  id: string;
  produtoId: number;
  produto: {
    nome: string;
    foto?: string;
  };
  quantidadeSolicitada: number;
  quantidadeAtendida: number;
  precoUnitario: number;
  observacao?: string;
}

export interface Pedido {
  empresaId: string;
  id: string;
  numero: string;
  fornecedorId: string;
  fornecedor: Fornecedor;
  itens: ItemPedido[];
  observacoes: string;
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'CANCELADO';
  total: number;
  dataSolicitacao: Date | string;
  dataAtualizacao: Date | string;
  usuario: {
    nome: string;
  };
}

export interface ItemPedidoCriacao {
  produtoId: number;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  observacao: string;
}

export interface Permissao {
  chave: string;
  concedida: boolean;
}