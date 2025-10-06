"use client";

import { FaSearch, FaBook, FaExclamationTriangle, FaHome, FaPlus, FaBox, FaBell, FaBuilding, FaUsers, FaDollarSign, FaCheck, FaInfo, FaHistory, FaShoppingCart, FaKey, FaLink, FaUserShield, FaStore, FaLock, FaUserTag, FaTruck } from "react-icons/fa";
import { useState, useEffect, useRef, useMemo } from "react";
import { cores } from "@/utils/cores";
import Image from "next/image";
import Fuse from "fuse.js";
import React from "react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

interface SearchableItem {
  id: string;
  title: string;
  parentTitle: string;
  parentTopicId: string;
  content: string;
  render: () => React.ReactNode;
}

interface FuseResult {
  item: SearchableItem;
  refIndex: number;
  score?: number;
}

export default function Ajuda() {
  const { t } = useTranslation("ajuda");
  const [modoDark, setModoDark] = useState(false);
  const [busca, setBusca] = useState("");
  const [topicoAtivo, setTopicoAtivo] = useState<string>("empresa");
  const [searchResults, setSearchResults] = useState<FuseResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const topicRefs = useRef<(HTMLDivElement | null)[]>([]);

  const temaAtual = modoDark ? cores.dark : cores.light;

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const temaSalvo = localStorage.getItem("modoDark");
    setModoDark(temaSalvo === "true");

    const style = document.createElement("style");
    style.textContent = `
      html::-webkit-scrollbar {
        width: 10px;
      }
      html::-webkit-scrollbar-track {
        background: ${temaSalvo === "true" ? "#132F4C" : "#F8FAFC"};
      }
      html::-webkit-scrollbar-thumb {
        background: ${temaSalvo === "true" ? "#132F4C" : "#90CAF9"}; 
        border-radius: 5px;
        border: 2px solid ${temaSalvo === "true" ? "#132F4C" : "#F8FAFC"};
      }
      html::-webkit-scrollbar-thumb:hover {
        background: ${temaSalvo === "true" ? "#132F4C" : "#64B5F6"}; 
      }
      html {
        scrollbar-width: thin;
        scrollbar-color: ${temaSalvo === "true" ? "#132F4C" : "#90CAF9"} ${temaSalvo === "true" ? "#0A1830" : "#F8FAFC"};
      }
      @media (max-width: 768px) {
        html::-webkit-scrollbar {
          width: 6px;
        }
        html::-webkit-scrollbar-thumb {
          border: 1px solid ${temaSalvo === "true" ? "#132F4C" : "#F8FAFC"};
          border-radius: 3px;
        }
      }
    `;
    document.head.appendChild(style);

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTopicoAtivo(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -60% 0px" }
    );
    const currentRefs = topicRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      document.head.removeChild(style);
      document.removeEventListener("mousedown", handleClickOutside);
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const searchIndex: SearchableItem[] = useMemo(
    () => [
      {
        id: "empresa",
        title: t("empresa.titulo"),
        parentTitle: t("empresa.titulo"),
        parentTopicId: "empresa",
        content: t("empresa.descricao"),
        render: () => <>{t("empresa.descricao")}</>,
      },
      {
        id: "empresa-criacao",
        title: t("empresa.secoes.criacao.titulo"),
        parentTitle: t("empresa.titulo"),
        parentTopicId: "empresa",
        content: t("empresa.secoes.criacao.conteudo"),
        render: () => (
          <>
            {t("empresa.secoes.criacao.conteudo")}
          </>
        ),
      },
      {
        id: "empresa-ativacao",
        title: t("empresa.secoes.ativacao.titulo"),
        parentTitle: t("empresa.titulo"),
        parentTopicId: "empresa",
        content: t("empresa.secoes.ativacao.conteudo"),
        render: () => (
          <>
            {t("empresa.secoes.ativacao.conteudo")}
          </>
        ),
      },
      {
        id: "empresa-catalogo",
        title: t("empresa.secoes.catalogo.titulo"),
        parentTitle: t("empresa.titulo"),
        parentTopicId: "empresa",
        content: t("empresa.secoes.catalogo.conteudo"),
        render: () => (
          <>
            {t("empresa.secoes.catalogo.conteudo")}
          </>
        ),
      },
      {
        id: "empresa-usuarios",
        title: t("empresa.secoes.usuarios.titulo"),
        parentTitle: t("empresa.titulo"),
        parentTopicId: "empresa",
        content: t("empresa.secoes.usuarios.conteudo"),
        render: () => (
          <>
            {t("empresa.secoes.usuarios.conteudo")}
          </>
        ),
      },
      {
        id: "produtos",
        title: t("produtos.titulo"),
        parentTitle: t("produtos.titulo"),
        parentTopicId: "produtos",
        content: t("produtos.descricao"),
        render: () => (
          <>
            {t("produtos.descricao")}
          </>
        ),
      },
      {
        id: "produtos-cadastro",
        title: t("produtos.secoes.cadastro.titulo"),
        parentTitle: t("produtos.titulo"),
        parentTopicId: "produtos",
        content: t("produtos.secoes.cadastro.conteudo"),
        render: () => <>{t("produtos.secoes.cadastro.conteudo")}</>,
      },
      {
        id: "produtos-quantidade-minima",
        title: t("produtos.secoes.quantidade_minima.titulo"),
        parentTitle: t("produtos.titulo"),
        parentTopicId: "produtos",
        content: t("produtos.secoes.quantidade_minima.conteudo"),
        render: () => <>{t("produtos.secoes.quantidade_minima.conteudo")}</>,
      },
      {
        id: "produtos-movimentacoes",
        title: t("produtos.secoes.movimentacoes.titulo"),
        parentTitle: t("produtos.titulo"),
        parentTopicId: "produtos",
        content: t("produtos.secoes.movimentacoes.conteudo"),
        render: () => <>{t("produtos.secoes.movimentacoes.conteudo")}</>,
      },
      {
        id: "produtos-historico",
        title: t("produtos.secoes.historico.titulo"),
        parentTitle: t("produtos.titulo"),
        parentTopicId: "produtos",
        content: t("produtos.secoes.historico.conteudo"),
        render: () => <>{t("produtos.secoes.historico.conteudo")}</>,
      },
      {
        id: "vendas",
        title: t("vendas.titulo"),
        parentTitle: t("vendas.titulo"),
        parentTopicId: "vendas",
        content: t("vendas.descricao"),
        render: () => <>{t("vendas.descricao")}</>,
      },
      {
        id: "vendas-realizando",
        title: t("vendas.secoes.realizando_venda.titulo"),
        parentTitle: t("vendas.titulo"),
        parentTopicId: "vendas",
        content: t("vendas.secoes.realizando_venda.conteudo"),
        render: () => (
          <>
            {t("vendas.secoes.realizando_venda.conteudo")}
          </>
        ),
      },
      {
        id: "clientes",
        title: t("vendas.secoes.clientes.titulo"),
        parentTitle: t("vendas.titulo"),
        parentTopicId: "vendas",
        content: t("vendas.secoes.clientes.conteudo"),
        render: () => (
          <>
            {t("vendas.secoes.clientes.conteudo")}
          </>
        ),
      },
      {
        id: "pedidos",
        title: t("pedidos.titulo"),
        parentTitle: t("pedidos.titulo"),
        parentTopicId: "pedidos",
        content: t("pedidos.descricao"),
        render: () => (
          <>
            {t("pedidos.descricao")}
          </>
        ),
      },
      {
        id: "pedidos-criacao",
        title: t("pedidos.secoes.criacao.titulo"),
        parentTitle: t("pedidos.titulo"),
        parentTopicId: "pedidos",
        content: t("pedidos.secoes.criacao.conteudo"),
        render: () => <>{t("pedidos.secoes.criacao.conteudo")}</>,
      },
      {
        id: "pedidos-status",
        title: t("pedidos.secoes.status.titulo"),
        parentTitle: t("pedidos.titulo"),
        parentTopicId: "pedidos",
        content: t("pedidos.secoes.status.conteudo"),
        render: () => (
          <>
            {t("pedidos.secoes.status.conteudo")}
          </>
        ),
      },
    ],
    [t]
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: ["title", "content"],
        includeScore: true,
        minMatchCharLength: 2,
        threshold: 0.4,
      }),
    [searchIndex]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setBusca(query);
    if (query.length > 2) {
      setSearchResults(fuse.search(query).slice(0, 10));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result: FuseResult) => {
    setTopicoAtivo(result.item.parentTopicId);
    const element = document.getElementById(result.item.id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
    setBusca("");
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const highlightMatches = (textNode: React.ReactNode, query: string): React.ReactNode => {
    if (!query) return textNode;
    if (typeof textNode !== "string") {
      if (React.isValidElement(textNode)) {
        const element = textNode as React.ReactElement<{ children?: React.ReactNode }>;
        if (element.props.children) {
          const children = React.Children.map(element.props.children, (child) => highlightMatches(child, query));
          return React.cloneElement(element, { ...element.props }, children);
        }
      }
      return textNode;
    }
    const parts = textNode.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="font-bold text-emerald-400">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const generateSnippet = (renderFn: () => React.ReactNode, query: string): React.ReactNode => {
    const fullContent = renderFn();
    return highlightMatches(fullContent, query);
  };

  const ConteudoProdutos = () => (
    <div className="space-y-8" style={{ color: temaAtual.texto }}>
      <section>
        <p className="text-lg mb-6">
          {t("produtos.descricao")}
        </p>
        <div className="p-4 rounded-lg mb-6 border-l-4" style={{ backgroundColor: modoDark ? "#1E4976" : "#EFF6FF", borderLeftColor: temaAtual.primario }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaInfo className="text-blue-500" />
            {t("produtos.fluxo.titulo")}
          </strong>
          <ol className="space-y-2 ml-4">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              {t("produtos.fluxo.passo1")}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              {t("produtos.fluxo.passo2")}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              {t("produtos.fluxo.passo3")}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
              {t("produtos.fluxo.passo4")}
            </li>
          </ol>
        </div>
      </section>

      <section id="produtos-cadastro">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaPlus className="text-green-500" />
          {t("produtos.secoes.cadastro.titulo")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
              <strong className="text-green-600 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                {t("produtos.secoes.cadastro.passo1")}
              </strong>
              <p className="text-sm mt-2 ml-8">{t("produtos.secoes.cadastro.descricao1")}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
              <strong className="text-green-600 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                {t("produtos.secoes.cadastro.passo2")}
              </strong>
              <p className="text-sm mt-2 ml-8">{t("produtos.secoes.cadastro.descricao2")}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
              <strong className="text-green-600 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                {t("produtos.secoes.cadastro.passo3")}
              </strong>
              <p className="text-sm mt-2 ml-8">{t("produtos.secoes.cadastro.descricao3")}</p>
            </div>
          </div>
          <div className="border-2 border-dashed rounded-lg flex items-center justify-center p-2" style={{ borderColor: temaAtual.borda }}>
            <Image src="/ajuda/novoproduto.png" alt={t("produtos.secoes.cadastro.imagem_alt")} width={400} height={95} quality={100} className="rounded-lg shadow-lg border" style={{ borderColor: temaAtual.borda, objectFit: "contain", maxWidth: "100%", height: "auto" }} />
          </div>
        </div>
      </section>

      <section id="produtos-quantidade-minima">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaBell className="text-yellow-500" />
          {t("produtos.secoes.quantidade_minima.titulo")}
        </h3>
        <div className="mb-6 text-center">
          <div className="inline-flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-lg" style={{ borderColor: temaAtual.borda }}>
            <label className="font-semibold text-lg">{t("produtos.secoes.quantidade_minima.label")}</label>
            <div className="px-4 py-2 border rounded-lg text-lg font-mono" style={{ borderColor: temaAtual.borda, backgroundColor: temaAtual.card }}>
              {t("produtos.secoes.quantidade_minima.exemplo")}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: modoDark ? "#422006" : "#FEFCE8", border: `1px solid ${modoDark ? "#653F12" : "#FDE68A"}` }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaExclamationTriangle className="text-yellow-500" />
              <strong>{t("produtos.secoes.quantidade_minima.status.atencao")}</strong>
            </div>
            <p className="text-sm">{t("produtos.secoes.quantidade_minima.status.descricao_atencao")}</p>
            <div className="text-2xl font-bold mt-2 text-yellow-600">15</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: modoDark ? "#450A0A" : "#FEF2F2", border: `1px solid ${modoDark ? "#7F1D1D" : "#FECACA"}` }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaExclamationTriangle className="text-red-500" />
              <strong>{t("produtos.secoes.quantidade_minima.status.critico")}</strong>
            </div>
            <p className="text-sm">{t("produtos.secoes.quantidade_minima.status.descricao_critico")}</p>
            <div className="text-2xl font-bold mt-2 text-red-600">5</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: modoDark ? "#052E16" : "#F0FDF4", border: `1px solid ${modoDark ? "#14532D" : "#BBF7D0"}` }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCheck className="text-green-500" />
              <strong>{t("produtos.secoes.quantidade_minima.status.normal")}</strong>
            </div>
            <p className="text-sm">{t("produtos.secoes.quantidade_minima.status.descricao_normal")}</p>
            <div className="text-2xl font-bold mt-2 text-green-600">25</div>
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1E4976" : "#EFF6FF" }}>
          <strong className="flex items-center gap-2">
            <FaBell className="text-blue-500" />
            {t("produtos.secoes.quantidade_minima.notificacoes.titulo")}
          </strong>
          <p className="text-sm mt-1">{t("produtos.secoes.quantidade_minima.notificacoes.descricao")}</p>
        </div>
      </section>

      <section id="produtos-movimentacoes">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaBox className="text-blue-500" />
          {t("produtos.secoes.movimentacoes.titulo")}
        </h3>
        <div className="mb-6">
          <p className="mb-4">{t("produtos.secoes.movimentacoes.descricao")}</p>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
              <strong className="text-blue-600 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                {t("produtos.secoes.movimentacoes.passo1")}
              </strong>
              <p className="text-sm mt-2 ml-8">{t("produtos.secoes.movimentacoes.descricao1")}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
              <strong className="text-blue-600 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                {t("produtos.secoes.movimentacoes.passo2")}
              </strong>
              <p className="text-sm mt-2 ml-8">{t("produtos.secoes.movimentacoes.descricao2")}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
              <strong className="text-blue-600 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                {t("produtos.secoes.movimentacoes.passo3")}
              </strong>
              <p className="text-sm mt-2 ml-8">{t("produtos.secoes.movimentacoes.descricao3")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="produtos-historico">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-500" />
          {t("produtos.secoes.historico.titulo")}
        </h3>
        <p className="mb-4">{t("produtos.secoes.historico.descricao")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F8FAFC", border: `1px solid ${modoDark ? "#2D4B75" : "#E2E8F0"}` }}>
            <strong className="text-blue-600 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              {t("produtos.secoes.historico.via_produtos")}
            </strong>
            <ol className="list-decimal list-inside text-sm space-y-2 pl-2">
              <li>{t("produtos.secoes.historico.passo1_produtos")}</li>
              <li>{t("produtos.secoes.historico.passo2_produtos")}</li>
              <li>{t("produtos.secoes.historico.passo3_produtos")}</li>
              <li>{t("produtos.secoes.historico.passo4_produtos")}</li>
            </ol>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F8FAFC", border: `1px solid ${modoDark ? "#2D4B75" : "#E2E8F0"}` }}>
            <strong className="text-blue-600 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              {t("produtos.secoes.historico.via_inventario")}
            </strong>
            <ol className="list-decimal list-inside text-sm space-y-2 pl-2">
              <li>{t("produtos.secoes.historico.passo1_inventario")}</li>
              <li>{t("produtos.secoes.historico.passo2_inventario")}</li>
              <li>{t("produtos.secoes.historico.passo3_inventario")}</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );

  const ConteudoEmpresa = () => (
    <div className="space-y-8" style={{ color: temaAtual.texto }}>
      <section>
        <p className="text-lg mb-6">{t("empresa.descricao")}</p>
        <div className="p-4 rounded-lg mb-6 border-l-4" style={{ backgroundColor: modoDark ? "#1E4976" : "#EFF6FF", borderLeftColor: temaAtual.primario }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaInfo className="text-blue-500" />
            {t("empresa.fluxo.titulo")}
          </strong>
          <ol className="space-y-2 ml-4">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              {t("empresa.fluxo.passo1")}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              {t("empresa.fluxo.passo2")}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              {t("empresa.fluxo.passo3")}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
              {t("empresa.fluxo.passo4")}
            </li>
          </ol>
        </div>
      </section>

      <section id="empresa-criacao">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaPlus className="text-green-500" />
          {t("empresa.secoes.criacao.titulo")}
        </h3>
        <p className="mb-4">
          {t("empresa.secoes.criacao.conteudo")}
        </p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaLink className="text-green-500" />
            {t("empresa.secoes.criacao.dominio_titulo")}
          </strong>
          <p className="text-sm mt-1">
            {t("empresa.secoes.criacao.dominio_descricao")}
          </p>
        </div>
      </section>

      <section id="empresa-ativacao">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaKey className="text-yellow-500" />
          {t("empresa.secoes.ativacao.titulo")}
        </h3>
        <p className="mb-4">
          {t("empresa.secoes.ativacao.conteudo")}
        </p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#422006" : "#FEFCE8", border: `1px solid ${modoDark ? "#653F12" : "#FDE68A"}` }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className="text-yellow-500" />
            {t("empresa.secoes.ativacao.necessario_titulo")}
          </strong>
          <p className="text-sm mt-1">{t("empresa.secoes.ativacao.necessario_descricao")}</p>
        </div>
      </section>

      <section id="empresa-catalogo">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaStore className="text-blue-500" />
          {t("empresa.secoes.catalogo.titulo")}
        </h3>
        <p className="mb-4">
          {t("empresa.secoes.catalogo.conteudo")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F8FAFC", border: `1px solid ${modoDark ? "#2D4B75" : "#E2E8F0"}` }}>
            <strong className="text-blue-600 flex items-center gap-2 mb-3">{t("empresa.secoes.catalogo.vitrine_titulo")}</strong>
            <p className="text-sm">{t("empresa.secoes.catalogo.vitrine_descricao")}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F8FAFC", border: `1px solid ${modoDark ? "#2D4B75" : "#E2E8F0"}` }}>
            <strong className="text-blue-600 flex items-center gap-2 mb-3">{t("empresa.secoes.catalogo.link_titulo")}</strong>
            <p className="text-sm">{t("empresa.secoes.catalogo.link_descricao")}</p>
          </div>
        </div>
      </section>

      <section id="empresa-usuarios">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUserShield className="text-green-500" />
          {t("empresa.secoes.usuarios.titulo")}
        </h3>
        <p className="mb-4">
          {t("empresa.secoes.usuarios.conteudo")}
        </p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1E4976" : "#EFF6FF" }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaUsers className="text-blue-500" />
            {t("empresa.secoes.usuarios.cargos_titulo")}
          </strong>
          <ul className="list-disc list-inside text-sm space-y-2 mt-2">
            <li>
              <strong>{t("empresa.secoes.usuarios.cargo_proprietario")}</strong>
            </li>
            <li>
              <strong>{t("empresa.secoes.usuarios.cargo_admin")}</strong>
            </li>
            <li>
              <strong>{t("empresa.secoes.usuarios.cargo_funcionario")}</strong>
            </li>
          </ul>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: temaAtual.borda }}>
            <strong className="flex items-center gap-2 mb-2">
              <FaLock className="text-blue-500" />
              {t("empresa.secoes.usuarios.permissoes_titulo")}
            </strong>
            <p className="text-sm">{t("empresa.secoes.usuarios.permissoes_descricao")}</p>
          </div>
        </div>
      </section>
    </div>
  );

  const ConteudoVendas = () => (
    <div className="space-y-8" style={{ color: temaAtual.texto }}>
      <section>
        <p className="text-lg mb-6">
          {t("vendas.descricao")}
        </p>
      </section>

      <section id="vendas-realizando">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaShoppingCart className="text-green-500" />
          {t("vendas.secoes.realizando_venda.titulo")}
        </h3>
        <p className="mb-4">{t("vendas.secoes.realizando_venda.descricao")}</p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1E4976" : "#EFF6FF" }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaInfo className="text-blue-500" />
            {t("vendas.secoes.realizando_venda.pontos_titulo")}
          </strong>
          <ul className="list-disc list-inside text-sm space-y-2 mt-2">
            <li>{t("vendas.secoes.realizando_venda.ponto1")}</li>
            <li>{t("vendas.secoes.realizando_venda.ponto2")}</li>
            <li>{t("vendas.secoes.realizando_venda.ponto3")}</li>
          </ul>
        </div>
      </section>

      <section id="clientes">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUserTag className="text-blue-500" />
          {t("vendas.secoes.clientes.titulo")}
        </h3>
        <p className="mb-4">
          {t("vendas.secoes.clientes.descricao")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F8FAFC", border: `1px solid ${modoDark ? "#2D4B75" : "#E2E8F0"}` }}>
            <strong className="text-blue-600 flex items-center gap-2 mb-3">{t("vendas.secoes.clientes.cadastro_titulo")}</strong>
            <p className="text-sm">{t("vendas.secoes.clientes.cadastro_descricao")}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F8FAFC", border: `1px solid ${modoDark ? "#2D4B75" : "#E2E8F0"}` }}>
            <strong className="text-blue-600 flex items-center gap-2 mb-3">{t("vendas.secoes.clientes.associacao_titulo")}</strong>
            <p className="text-sm">{t("vendas.secoes.clientes.associacao_descricao")}</p>
          </div>
        </div>
      </section>
    </div>
  );

  const ConteudoPedidos = () => (
    <div className="space-y-8" style={{ color: temaAtual.texto }}>
      <section>
        <p className="text-lg mb-6">
          {t("pedidos.descricao")}
        </p>
      </section>

      <section id="pedidos-criacao">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaPlus className="text-green-500" />
          {t("pedidos.secoes.criacao.titulo")}
        </h3>
        <p className="mb-4">{t("pedidos.secoes.criacao.descricao")}</p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
            <strong className="text-green-600 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              {t("pedidos.secoes.criacao.passo1")}
            </strong>
            <p className="text-sm mt-2 ml-8">{t("pedidos.secoes.criacao.descricao1")}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
            <strong className="text-green-600 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              {t("pedidos.secoes.criacao.passo2")}
            </strong>
            <p className="text-sm mt-2 ml-8">{t("pedidos.secoes.criacao.descricao2")}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1A365D" : "#F0FDF4", border: `1px solid ${modoDark ? "#2D4B75" : "#BBF7D0"}` }}>
            <strong className="text-green-600 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              {t("pedidos.secoes.criacao.passo3")}
            </strong>
            <p className="text-sm mt-2 ml-8">{t("pedidos.secoes.criacao.descricao3")}</p>
          </div>
        </div>
      </section>

      <section id="pedidos-status">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-500" />
          {t("pedidos.secoes.status.titulo")}
        </h3>
        <p className="mb-4">{t("pedidos.secoes.status.descricao")}</p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? "#1E4976" : "#EFF6FF" }}>
          <strong className="flex items-center gap-2 mb-2">
            <FaInfo className="text-blue-500" />
            {t("pedidos.secoes.status.pontos_titulo")}
          </strong>
          <ul className="list-disc list-inside text-sm space-y-2 mt-2">
            <li>{t("pedidos.secoes.status.ponto1")}</li>
            <li>{t("pedidos.secoes.status.ponto2")}</li>
            <li>{t("pedidos.secoes.status.ponto3")}</li>
          </ul>
        </div>
      </section>
    </div>
  );

  const menuItems = [
    { id: "empresa", titulo: t("empresa.titulo"), icone: <FaBuilding className="text-xl" /> },
    { id: "produtos", titulo: t("produtos.titulo"), icone: <FaBox className="text-xl" /> },
    { id: "vendas", titulo: t("vendas.titulo"), icone: <FaDollarSign className="text-xl" /> },
    { id: "pedidos", titulo: t("pedidos.titulo"), icone: <FaTruck className="text-xl" /> },
    { id: "clientes", anchor: true, targetId: "vendas", titulo: t("vendas.secoes.clientes.titulo"), icone: <FaUserTag className="text-xl" /> },
  ];

  const topicos = [
    { id: "empresa", titulo: t("empresa.titulo"), icone: <FaBuilding className="text-xl" />, componente: ConteudoEmpresa, descricao: t("empresa.descricao_curta") },
    { id: "produtos", titulo: t("produtos.titulo"), icone: <FaBox className="text-xl" />, componente: ConteudoProdutos, descricao: t("produtos.descricao_curta") },
    { id: "vendas", titulo: t("vendas.titulo"), icone: <FaDollarSign className="text-xl" />, componente: ConteudoVendas, descricao: t("vendas.descricao_curta") },
    { id: "pedidos", titulo: t("pedidos.titulo"), icone: <FaTruck className="text-xl" />, componente: ConteudoPedidos, descricao: t("pedidos.descricao_curta") },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      <header className="pt-8 pb-4" style={{ backgroundColor: temaAtual.fundo }}>
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">{t("titulo")}</h1>
              <FaBook className="text-4xl" style={{ color: temaAtual.primario }} />
            </div>
            <p className="text-lg" style={{ color: temaAtual.placeholder }}>
              {t("subtitulo")}
            </p>
          </div>
          <div ref={searchRef} className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch style={{ color: temaAtual.placeholder }} />
            </div>
            <input
              type="text"
              placeholder={t("pesquisa.placeholder")}
              value={busca}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.borda }}
            />
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto rounded-lg shadow-lg z-10" style={{ backgroundColor: temaAtual.card, border: `1px solid ${temaAtual.borda}` }}>
                {searchResults.map((result) => (
                  <div key={result.item.id} onClick={() => handleSearchResultClick(result)} className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b" style={{ borderColor: temaAtual.borda }}>
                    <div className="font-semibold text-sm" style={{ color: temaAtual.texto }}>
                      {highlightMatches(result.item.title, busca)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: temaAtual.placeholder }}>
                      {generateSnippet(result.item.render, busca)}
                    </div>
                    <div className="text-xs mt-2 font-semibold" style={{ color: temaAtual.placeholder }}>
                      {t("pesquisa.em")} {result.item.parentTitle}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="w-full max-w-6xl mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="border rounded-xl p-4 sticky top-4" style={{ backgroundColor: temaAtual.card, borderColor: temaAtual.borda }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaHome />
                {t("menu.topicos")}
              </h3>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.anchor ? `#${item.id}` : `#${item.targetId || item.id}`}
                    onClick={() => {
                      setTopicoAtivo(item.targetId || item.id);
                      setBusca("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${topicoAtivo === (item.targetId || item.id) ? "font-semibold" : "font-normal"}`}
                    style={{ backgroundColor: topicoAtivo === (item.targetId || item.id) ? temaAtual.ativo : "transparent", color: topicoAtivo === (item.targetId || item.id) ? "#fff" : temaAtual.texto }}
                    onMouseEnter={(e) => {
                      if (topicoAtivo !== (item.targetId || item.id)) {
                        e.currentTarget.style.backgroundColor = temaAtual.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (topicoAtivo !== (item.targetId || item.id)) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {item.icone}
                    <span>{item.titulo}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="space-y-8">
              {topicos.map((topico, index) => (
                <div
                  key={topico.id}
                  id={topico.id}
                  ref={(el) => {
                    topicRefs.current[index] = el;
                  }}
                  className="border rounded-xl shadow-lg overflow-hidden"
                  style={{ backgroundColor: temaAtual.card, borderColor: temaAtual.borda }}
                >
                  <div className="w-full p-6">
                    <div className="flex items-center gap-4">
                      {topico.icone}
                      <div>
                        <h2 className="text-2xl font-bold">{topico.titulo}</h2>
                        <p className="text-sm opacity-80 mt-1">{topico.descricao}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t" style={{ borderColor: temaAtual.borda }}>
                    <topico.componente />
                  </div>
                </div>
              ))}
            </div>
            <footer className="mt-12 text-center" style={{ color: temaAtual.placeholder }}>
              <p className="text-sm">{t("footer.contato")}</p>
              <p className="text-xs mt-2">{t("footer.copyright", { ano: new Date().getFullYear() })}</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}