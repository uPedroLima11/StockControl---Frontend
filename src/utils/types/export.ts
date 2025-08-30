export interface ExportHistory {
  id: string;
  descricao: string;
  createdAt: string;
  tipo: string;
  usuario?: {
    nome: string;
  };
}

export interface ExportOptions {
  format: 'excel'
  startDate?: string;
  endDate?: string;
  empresaId: string;
}