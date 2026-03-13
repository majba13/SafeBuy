'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const PAYMENT_INFO: Record<string, { name: string; number: string; icon: string; instructions: string[] }> = {
  bkash: {
    name: 'bKash',
    number: '01752962104',
    icon: '📱',
    instructions: [
      'Open bKash app and tap Send Money',
      'Send exact amount to 01752962104',
      'Use your Order ID as reference',
      'Submit transaction ID below',
    ],
  },
  nagad: {
    name: 'Nagad',
    number: '01752962104',
    icon: '💳',
    instructions: [
      'Open Nagad app and choose Send Money',
      'Send exact amount to 01752962104',
      'Add Order ID in remarks',
      'Submit transaction ID below',
    ],
  },
  rocket: {
    name: 'Rocket',
    number: '017529621040',
    icon: '🚀',
    instructions: [
      'Open Rocket or dial *322#',
      'Send exact amount to 017529621040',
      'Keep payment confirmation message',
      'Submit transaction ID below',
    ],
  },
  bank_transfer: {
    name: 'Bank Transfer',
    number: '20501306700352701',
    icon: '🏦',
    instructions: [
      'Transfer amount to account 20501306700352701',
      'Bank: Islami Bank Bangladesh Ltd',
      'Use Order ID in remarks',
      'Submit transaction reference below',
    ],
  },
};

function PaymentPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAppSelector((s) => s.auth);

  const orderId = params.orderId as string;
  const method = searchParams.get('method') || 'bkash';
  const amount = Number(searchParams.get('amount') || 0);

  const [txId, setTxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const info = PAYMENT_INFO[method];

  const submitPayment = async () => {
    if (!txId.trim()) {
      toast.error('Transaction ID is required');
      return;
    }

    if (method !== 'bank_transfer' && !senderNumber.trim()) {
      toast.error('Sender number is required');
      return;
    }

    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/payments/submit', {
        method: 'POST',
        token: accessToken,
        body: {
          orderId,
          transactionId: txId,
          senderNumber,
          method,
          amount,
        },
      });

      setSubmitted(true);
      toast.success('Payment submitted. Verification in progress.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (!info) {
    return (
      <>
        <Header />
        <main className="market-container py-20 text-center">
          <p className="text-error">Invalid payment method.</p>
        </main>
        <Footer />
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="market-container py-16">
          <div className="mx-auto max-w-lg rounded-3xl border border-success/30 bg-emerald-50 p-8 text-center">
            <div className="text-5xl">✅</div>
            <h1 className="mt-4 text-3xl font-bold text-text-primary">Payment Submitted</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Your payment details are received for order <strong>#{orderId}</strong>. We will verify and confirm shortly.
            </p>
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              Track my order
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="market-container py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-text-primary">Complete Payment</h1>
          <p className="mt-1 text-sm text-text-secondary">Order #{orderId}</p>

          <div className="mt-5 rounded-2xl border border-accent/30 bg-orange-50 p-5 text-center">
            <p className="text-sm text-text-secondary">Amount to pay</p>
            <p className="mt-1 text-4xl font-bold text-accent">৳{amount.toLocaleString()}</p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="surface-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">{info.icon}</span>
                <h2 className="text-xl font-bold text-text-primary">{info.name} Instructions</h2>
              </div>

              <div className="rounded-xl border border-border bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-text-secondary">{method === 'bank_transfer' ? 'Account Number' : 'Payment Number'}</p>
                <p className="mt-1 text-xl font-bold text-text-primary">{info.number}</p>
              </div>

              <ol className="mt-4 space-y-2">
                {info.instructions.map((step, index) => (
                  <li key={step} className="flex gap-2 text-sm text-text-secondary">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="surface-card p-5">
              <h2 className="text-xl font-bold text-text-primary">Submit Transaction</h2>
              <p className="mt-1 text-sm text-text-secondary">After payment, share your transaction details.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">Transaction ID</label>
                  <input
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="e.g. BX73829104"
                    className="h-11 w-full rounded-xl border border-border px-3 text-sm"
                  />
                </div>

                {method !== 'bank_transfer' ? (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Sender Number</label>
                    <input
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="h-11 w-full rounded-xl border border-border px-3 text-sm"
                    />
                  </div>
                ) : null}

                <button
                  onClick={submitPayment}
                  disabled={loading}
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Payment Details'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
