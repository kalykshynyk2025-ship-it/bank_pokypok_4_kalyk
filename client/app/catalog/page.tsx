'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/context/i18n-context';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  questEligible: boolean;
}

export default function CatalogPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProducts() {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    }

    loadProducts();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('catalog.title')}</h1>
        <p className="mt-2 text-slate-700">{t('catalog.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <article key={product._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="mt-2 text-sm text-slate-700">{product.description}</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{t('catalog.price')}: {product.price} ₽</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setMessage(`${t('catalog.buyClicked')}: ${product.name}`)}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
              >
                {t('catalog.buy')}
              </button>

              <button
                onClick={() => setMessage(`${t('catalog.questClicked')}: ${product.name}`)}
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800"
              >
                {t('catalog.getByQuest')}
              </button>
            </div>
          </article>
        ))}
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
