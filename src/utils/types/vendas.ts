import { ClienteI } from "./clientes";
import { ProdutoI } from "./produtos";

export interface VendaI {
  id: number;
  empresaId: string;
  produtoId: number;
  usuarioId?: string;
  clienteId?: string;
  quantidade: number;
  valorVenda: number;
  valorCompra: number;
  createdAt?: string;
  updatedAt?: string;
  produto?: ProdutoI;
  cliente?: ClienteI;
  
}