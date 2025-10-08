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
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);

    const handleThemeChange = (e: CustomEvent) => {
      setModoDark(e.detail.modoDark);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/login";
    }

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
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
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
    <div className={`min-h-screen ${modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200"}`}>
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto">
            <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${modoDark ? "bg-slate-800/30" : "bg-white/30"} backdrop-blur-sm border ${modoDark ? "border-blue-500/30" : "border-blue-200"}`}>
              <div className="absolute inset-0">
                <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
                <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <h1 className={`text-3xl md:text-4xl font-bold ${modoDark ? "text-white" : "text-slate-900"}`}>
                    {t("titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("ajuda")}</span>
                  </h1>
                  <FaBook className={`text-4xl ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                </div>
                <p className={`text-lg ${modoDark ? "text-gray-300" : "text-slate-600"} max-w-2xl mx-auto`}>{t("subtitulo")}</p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className={`rounded-2xl border ${modoDark ? "border-blue-500/30" : "border-blue-200"} ${modoDark ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm overflow-hidden sticky top-4`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h3 className="font-semibold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaHome className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      {t("menu.topicos")}
                    </h3>
                  </div>
                  <nav className="p-2">
                    {menuItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.anchor ? `#${item.id}` : `#${item.targetId || item.id}`}
                        onClick={() => {
                          setTopicoAtivo(item.targetId || item.id);
                          setBusca("");
                        }}
                        className={`w-full hover:scale-105 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 mb-1 ${topicoAtivo === (item.targetId || item.id)
                            ? "shadow-lg font-semibold"
                            : "font-normal"
                          }`}
                        style={{
                          backgroundColor: topicoAtivo === (item.targetId || item.id)
                            ? temaAtual.primario
                            : "transparent",
                          color: topicoAtivo === (item.targetId || item.id)
                            ? "#FFFFFF"
                            : temaAtual.texto
                        }}
                      >
                        <div className={`p-2 rounded-lg ${topicoAtivo === (item.targetId || item.id)
                            ? "bg-white/20"
                            : modoDark ? "bg-slate-700/50" : "bg-slate-100"
                          }`}>
                          {item.icone}
                        </div>
                        <span>{item.titulo}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="relative" ref={searchRef}>
                    <div className={`relative rounded-2xl border ${modoDark ? "border-blue-500/30" : "border-blue-200"} ${modoDark ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm overflow-hidden p-4`}>
                    <div className="absolute inset-y-0 left-20 flex items-center pointer-events-none" style={{ left: "1cm" }}>
                      <FaSearch className={modoDark ? "text-blue-400" : "text-blue-500"} />
                    </div>
                    <input
                      type="text"
                      placeholder={t("pesquisa.placeholder")}
                      value={busca}
                      onChange={handleSearchChange}
                      onFocus={() => setIsSearchFocused(true)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      borderColor: temaAtual.borda
                      }}
                    />
                    </div>
                  {isSearchFocused && searchResults.length > 0 && (
                    <div
                      className={`absolute top-full mt-2 w-full max-h-80 overflow-y-auto rounded-xl shadow-2xl z-50 border backdrop-blur-sm ${modoDark ? "bg-slate-800/95" : "bg-white/95"
                        }`}
                      style={{ borderColor: temaAtual.borda }}
                    >
                      {searchResults.map((result, index) => (
                        <div
                          key={result.item.id}
                          onClick={() => handleSearchResultClick(result)}
                          className={`p-4 cursor-pointer transition-all duration-200 border-b ${modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                            }`}
                          style={{
                            borderColor: temaAtual.borda,
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <div className="font-semibold text-sm flex items-center gap-2" style={{ color: temaAtual.texto }}>
                            <div className={`p-1 rounded ${modoDark ? "bg-blue-500/20" : "bg-blue-100"
                              }`}>
                              {result.item.parentTitle === t("empresa.titulo") && <FaBuilding className="text-xs" />}
                              {result.item.parentTitle === t("produtos.titulo") && <FaBox className="text-xs" />}
                              {result.item.parentTitle === t("vendas.titulo") && <FaDollarSign className="text-xs" />}
                              {result.item.parentTitle === t("pedidos.titulo") && <FaTruck className="text-xs" />}
                            </div>
                            {highlightMatches(result.item.title, busca)}
                          </div>
                          <div className="text-xs mt-1 line-clamp-2" style={{ color: temaAtual.placeholder }}>
                            {generateSnippet(result.item.render, busca)}
                          </div>
                          <div className="text-xs mt-2 font-semibold flex items-center gap-1" style={{ color: temaAtual.primario }}>
                            {t("pesquisa.em")} {result.item.parentTitle}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {topicos.map((topico, index) => (
                    <div
                      key={topico.id}
                      id={topico.id}
                      ref={(el) => {
                        topicRefs.current[index] = el;
                      }}
                      className={`relative bg-gradient-to-r ${modoDark ? "from-blue-500/5 to-cyan-500/5" : "from-blue-100/30 to-cyan-100/30"} rounded-2xl border ${modoDark ? "border-blue-500/20" : "border-blue-200"} p-1  backdrop-blur-sm`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className={`rounded-2xl ${modoDark ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm overflow-hidden`}>
                        <div className="w-full p-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${modoDark ? "bg-blue-500/20" : "bg-blue-100"
                              }`}>
                              {topico.icone}
                            </div>
                            <div>
                              <h2 className={`text-2xl font-bold ${modoDark ? "text-white" : "text-slate-900"}`}>{topico.titulo}</h2>
                              <p className={`text-sm ${modoDark ? "text-gray-400" : "text-slate-500"} mt-1`}>{topico.descricao}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 border-t" style={{ borderColor: temaAtual.borda }}>
                          <topico.componente />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <footer className={`mt-12 text-center p-6 rounded-2xl border ${modoDark ? "border-blue-500/30" : "border-blue-200"} ${modoDark ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm`}>
                  <p className={`text-sm ${modoDark ? "text-gray-400" : "text-slate-500"}`}>{t("footer.contato")}</p>
                  <p className={`text-xs mt-2 ${modoDark ? "text-gray-400" : "text-slate-500"}`}>{t("footer.copyright", { ano: new Date().getFullYear() })}</p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}