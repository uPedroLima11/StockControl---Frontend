export interface UsuarioI {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    empresaId: string | null;
    createdAt: string;
    updatedAt: string;
  }