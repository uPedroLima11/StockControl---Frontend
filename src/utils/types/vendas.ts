export interface VendaI {
    id: number;
    empresaId: string;
    produtoId: number;
    quantidade: number;
    valorVenda: number;
    valorCompra: number;
    createdAt: Date;
    updatedAt: Date;
    produto?: { 
        nome: string;
        preco: number;
       
    };
}