'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro no catálogo:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Algo deu errado!
        </h2>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar o catálogo.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}