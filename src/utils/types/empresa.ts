export interface EmpresaI {
  id: string;
  nome?: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  email?: string;
  foto?: string;
  ChaveAtivacao: {
    chave: string;
    empresaId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}