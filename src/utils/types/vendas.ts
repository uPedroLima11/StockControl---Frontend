export interface VendaI {
    id: number;
    empresaId: string;
    produtoId: number;
    quantidade: number;
    valorVenda: number;
    valorCompra: number;
    createdAt: Date;
    updatedAt: Date;
    usuarioId: string;
    produto?: { 
        nome: string;
        preco: number;
       
    };
}