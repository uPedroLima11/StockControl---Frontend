export interface PermissaoI {
    id: string;
    nome: string;
    descricao: string;
    chave: string;
    categoria: string;
    createdAt: Date;
    updatedAt: Date;
    UsuarioPermissao: UsuarioPermissao[];
}

export interface UsuarioPermissao {
    id: string;
    usuarioId: string;
    permissaoId: string;
    concedida: boolean;
    createdAt: Date;
    updatedAt: Date;
}