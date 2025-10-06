import { ItemPedido } from ".";
import { EmpresaI } from "./empresa";
import { FornecedorI } from "./fornecedor";
import { UsuarioI } from "./usuario";

export enum StatusPedido {
    PENDENTE = "PENDENTE",
    PROCESSANDO = "PROCESSANDO",
    CONCLUIDO = "CONCLUIDO",
    CANCELADO = "CANCELADO",
}


export interface PedidoI {
    dataSolicitacao: string | Date;
    id: string;
    numero: string;
    fornecedor: FornecedorI;
    fornecedorId: string;
    empresa: EmpresaI;
    empresaId: string;
    usuario: UsuarioI;
    usuarioId: string;
    observacoes?: string;
    status: StatusPedido;
    total: number;
    itens: ItemPedido[];
    createdAt: Date;
    updatedAt: Date;
}
