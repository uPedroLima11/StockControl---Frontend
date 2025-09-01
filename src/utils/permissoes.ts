export const usuarioTemPermissao = async (userId: string, permissaoChave: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${userId}/tem-permissao/${permissaoChave}`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.temPermissao;
    }
    return false;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
};

export const carregarPermissoesUsuario = async (userId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${userId}/permissoes`
    );
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Erro ao carregar as permissões:", error);
    return null;
  }
};