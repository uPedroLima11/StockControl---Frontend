'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface ProdutoCatalogo {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  foto?: string;
  quantidade: number;
  vendas: number;
}

interface CatalogoProps {
  empresa: {
    nome: string;
    foto?: string;
    telefone?: string;
    email?: string;
  };
  produtos: ProdutoCatalogo[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CatalogoPublico({ params }: PageProps) {
  const { slug } = use(params);

  const [data, setData] = useState<CatalogoProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogoDesativado, setCatalogoDesativado] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoCatalogo | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const produtosPorPagina = 15; 

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#111827';
    document.body.style.color = '#ffffff';

    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_URL_API || 'http://localhost:3001';
        const url = `${apiUrl}/catalogo/${slug}`;

        const res = await fetch(url);


        if (!res.ok) {
          if (res.status === 404) {
            const errorData = await res.json();
            if (errorData.mensagem === "Catálogo não está ativado para esta empresa") {
              setCatalogoDesativado(true);
              setError("Catálogo não está ativado");
              return;
            }
            throw new Error('Catálogo não encontrado');
          }
          throw new Error(`Erro ${res.status}: ${await res.text()}`);
        }

        const catalogoData = await res.json();
        setData(catalogoData);
      } catch (err) {
        console.error('Erro ao buscar catálogo:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogo();
  }, [slug]);

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const produtosFiltrados = data?.produtos.filter(produto =>
    produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(termoBusca.toLowerCase())
  ) || [];

  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosFiltrados.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (catalogoDesativado) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Catálogo Desativado</h1>
          <p className="text-gray-300">O catálogo desta empresa não está disponível no momento.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Catálogo não disponível</h1>
          <p className="text-gray-300">{error || 'Empresa não encontrada'}</p>
        </div>
      </div>
    );
  }

  const { empresa, produtos } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-6">
            <div className="flex items-center space-x-4">
              {empresa.foto && (
                <div className="relative">
                  <Image
                    src={empresa.foto}
                    alt={empresa.nome}
                    width={70}
                    height={70}
                    className="rounded-full border-2 border-emerald-400/30 shadow-lg"
                  />
                  <div className="absolute -inset-1 bg-emerald-400/20 rounded-full blur-sm -z-10"></div>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold  bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {empresa.nome}
                </h1>
                <p className="text-sm text-gray-400">Catálogo Digital</p>
              </div>
            </div>

            {(empresa.telefone || empresa.email) && (
              <div className="text-sm text-gray-300 text-center sm:text-right space-y-1">
                {empresa.telefone && (
                  <p className="flex items-center justify-center sm:justify-end gap-2">
                    <span className="w-4 h-4 bg-emerald-400/20 rounded-full flex items-center justify-center">
                      📞
                    </span>
                    {empresa.telefone}
                  </p>
                )}
                {empresa.email && (
                  <p className="flex items-center justify-center sm:justify-end gap-2">
                    <span className="w-4 h-4 bg-emerald-400/20 rounded-full flex items-center justify-center">
                      ✉️
                    </span>
                    {empresa.email}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {produtos.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/30">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🛒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              Catálogo Vazio
            </h2>
            <p className="text-gray-400">
              Nenhum produto disponível no momento.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Nossos Produtos
              </h2>
              <p className="text-gray-400">
                {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={termoBusca}
                  onChange={(e) => {
                    setTermoBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className="w-full px-4 py-2 pl-10 bg-gray-800/60 border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => mudarPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className={`p-2 rounded-full ${paginaAtual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <span className="text-sm text-gray-300">
                    Página {paginaAtual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() => mudarPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className={`p-2 rounded-full ${paginaAtual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {produtosAtuais.map((produto) => (
                <div
                  key={produto.id}
                  onClick={() => setProdutoSelecionado(produto)}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  <div className="bg-gray-800/60 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/30 shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-400/30 transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-40 w-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden p-2">
                      {produto.foto ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={produto.foto}
                            alt={produto.nome}
                            width={200}
                            height={150}
                            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500"
                            style={{
                              width: 'auto',
                              height: 'auto',
                              maxWidth: '100%',
                              maxHeight: '100%'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl text-gray-500">📦</span>
                          <p className="text-xs text-gray-400 mt-1">Sem imagem</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-3 flex-grow flex flex-col">
                      <h3 className="font-semibold text-sm mb-2 text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
                        {produto.nome}
                      </h3>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-emerald-400">
                          {formatarPreco(produto.preco)}
                        </span>
                        {produto.quantidade > 0 ? (
                          <span className="px-2 py-1 bg-emerald-400/10 text-emerald-300 text-xs rounded-full border border-emerald-400/20">
                            Disponível
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-400/10 text-red-300 text-xs rounded-full border border-red-400/20">
                            Esgotado
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between text-xs text-gray-400 mt-auto">
                        <span>Estoque: {produto.quantidade}</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                          {produto.vendas} vendidos
                        </span>
                      </div>

                      {produto.descricao && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {produto.descricao}
                          </p>
                          <button className="text-emerald-400 text-xs mt-1 hover:text-emerald-300 transition-colors">
                            Ver detalhes →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-md rounded-lg p-2 border border-gray-700/30">
                  <button
                    onClick={() => mudarPagina(1)}
                    disabled={paginaAtual === 1}
                    className={`px-3 py-1 rounded ${paginaAtual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => mudarPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className={`px-3 py-1 rounded ${paginaAtual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPaginas ||
                      (page >= paginaAtual - 1 && page <= paginaAtual + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => mudarPagina(page)}
                          className={`px-3 py-1 rounded ${paginaAtual === page ? 'bg-emerald-500 text-white' : 'hover:bg-gray-700'}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === paginaAtual - 2 ||
                      page === paginaAtual + 2
                    ) {
                      return <span key={page} className="px-1 text-gray-400">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => mudarPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className={`px-3 py-1 rounded ${paginaAtual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => mudarPagina(totalPaginas)}
                    disabled={paginaAtual === totalPaginas}
                    className={`px-3 py-1 rounded ${paginaAtual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {produtoSelecionado && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={() => setProdutoSelecionado(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 hover:scale-100 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 w-full bg-gradient-to-br from-gray-700 to-gray-900">
              <div className="relative h-full w-full flex items-center justify-center">
                <Image
                  src={produtoSelecionado.foto || '/placeholder-produto.jpg'}
                  alt={produtoSelecionado.nome}
                  width={600}
                  height={400}
                  className="object-contain w-full h-full"
                  quality={100}
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-produto.jpg';
                  }}
                />
              </div>
              <button
                onClick={() => setProdutoSelecionado(null)}
                className="absolute cursor-pointer top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-full p-2 text-white hover:bg-gray-700/80 transition-colors border border-gray-600/50"
              >
                <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {produtoSelecionado.nome}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-emerald-400">
                    {formatarPreco(produtoSelecionado.preco)}
                  </span>
                  {produtoSelecionado.quantidade > 0 ? (
                    <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 text-sm rounded-full border border-emerald-400/30">
                      Em estoque
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-400/20 text-red-300 text-sm rounded-full border border-red-400/30">
                      Esgotado
                    </span>
                  )}
                </div>
              </div>

              {produtoSelecionado.descricao && (
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <h3 className="font-semibold text-white mb-2">Descrição</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {produtoSelecionado.descricao}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {produtoSelecionado.quantidade}
                  </div>
                  <div className="text-sm text-gray-400">Unidades disponíveis</div>
                </div>

                <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    {produtoSelecionado.vendas}
                  </div>
                  <div className="text-sm text-gray-400">Total vendido</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800/80 backdrop-blur-md border-t border-gray-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {empresa.nome} - Catálogo Digital
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}