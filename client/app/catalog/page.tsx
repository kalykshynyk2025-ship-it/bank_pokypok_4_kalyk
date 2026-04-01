'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/context/i18n-context';
import { getUser } from '@/lib/auth';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  questEligible: boolean;
}

interface OrderState {
  orderId: string;
  status: string;
  paymentUrl: string;
}

export default function CatalogPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState<Record<string, OrderState>>({});

  useEffect(() => {
    async function loadProducts() {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    }

    loadProducts();
  }, []);

  async function buyProduct(product: Product) {
    const user = getUser();

    if (!user?.id) {
      setMessage(t('catalog.loginNeeded'));
      return;
    }

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, productId: product._id })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || t('catalog.orderError'));
      return;
    }

    setOrders((prev) => ({
      ...prev,
      [product._id]: {
        orderId: data.order._id,
        status: data.order.status,
        paymentUrl: data.payment.paymentUrl
      }
    }));

    setMessage(`${t('catalog.orderCreated')}: ${product.name}`);
  }

  async function confirmPayment(productId: string) {
    const order = orders[productId];
    if (!order) {
      return;
    }

    await fetch(order.paymentUrl);

    const statusResponse = await fetch(`/api/orders/${order.orderId}/status`);
    const statusData = await statusResponse.json();

    setOrders((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        status: statusData.status
      }
    }));

    setMessage(`${t('catalog.orderStatus')}: ${statusData.status}`);
  }

  return (
    <section className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold">{t('catalog.title')}</h1>
        <p className="mt-2 text-slate-700">{t('catalog.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => {
          const order = orders[product._id];

          return (
            <article key={product._id} className="soft-card soft-pink">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="mt-2 text-sm text-slate-700">{product.description}</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {t('catalog.price')}: {product.price} ₽
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => buyProduct(product)}
                  className="btn-primary"
                >
                  {t('catalog.buy')}
                </button>

                <button
                  onClick={() => setMessage(`${t('catalog.questClicked')}: ${product.name}`)}
                  className="btn-secondary"
                >
                  {t('catalog.getByQuest')}
                </button>
              </div>

              {order && (
                <div className="mt-3 rounded-xl border border-white/60 bg-white/70 p-3 text-sm">
                  <p>
                    {t('catalog.orderStatus')}: <b>{order.status}</b>
                  </p>
                  <button
                    onClick={() => confirmPayment(product._id)}
                    className="mt-2 rounded border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                  >
                    {t('catalog.payWithVtb')}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
