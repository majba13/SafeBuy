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
      'Open your bKash app',
      'Tap "Send Money"',
      'Enter number: 01752962104',
      'Enter the exact amount',
      'Add your Order ID in Reference',
      'Complete with your bKash PIN',
    ],
  },
  nagad: {
    name: 'Nagad',
    number: '01752962104',
    icon: '💳',
    instructions: [
      'Open your Nagad app',
      'Tap "Send Money"',
      'Enter number: 01752962104',
      'Enter the exact amount',
      'Add your Order ID in Reference',
      'Confirm payment',
    ],
  },
  rocket: {
    name: 'Rocket',
    number: '01752962104',
    icon: '🚀',
    instructions: [
      'Dial *322# or use Rocket app',
      'Choose "Send Money"',
      'Enter number: 017529621040 (add 0 at end)',
      'Enter the exact amount',
      'Add reference note',
      'Enter your Rocket PIN',
    ],
  },
  bank_transfer: {
    name: 'Islami Bank Transfer',
    number: '20501306700352701',
    icon: '🏦',
    instructions: [
      'Log into your internet/mobile banking',
      'Go to Fund Transfer → Other Bank',
      'Bank: Islami Bank Bangladesh Ltd',
      'Account: 20501306700352701',
      'Routing: 125264097',
      'Add Order ID in remarks',
      'Transfer the exact amount',
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
    if (!txId.trim()) { toast.error('Transaction ID is required'); return; }
    if (!senderNumber.trim() && method !== 'bank_transfer') { toast.error('Sender number is required'); return; }
    if (!accessToken) { router.push('/auth/login'); return; }

    setLoading(true);
    try {
      await apiFetch(`/payments/submit`, {
        method: 'POST',
        body: JSON.stringify({ orderId, transactionId: txId, senderNumber, method, amount }),
        token: accessToken,
      });
      setSubmitted(true);
      toast.success('Payment submitted! We will verify and confirm within a few minutes.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (!info) {
    return <div className="text-center py-20 text-red-500">Invalid payment method</div>;
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your payment details have been received. We will verify and confirm your order within a few minutes.
          </p>
          <p className="text-sm text-gray-500 mb-8 bg-orange-50 border border-orange-200 rounded-lg p-3">
            📋 Order ID: <strong>{orderId}</strong>
          </p>
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition"
          >
            Track My Order
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-500 text-sm mb-6">Order #{orderId}</p>

        {/* Amount box */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
          <p className="text-3xl font-extrabold text-orange-600">৳{amount.toLocaleString()}</p>
        </div>

        {/* Payment instructions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{info.icon}</span>
            <h2 className="font-bold text-gray-900">Pay via {info.name}</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              {method === 'bank_transfer' ? 'Account Number' : `${info.name} Number`}
            </p>
            <p className="text-xl font-bold text-gray-900 tracking-widest">{info.number}</p>
          </div>

          <ol className="space-y-2">
            {info.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Submit form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">I have completed the payment</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Transaction ID *</label>
              <input
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. BX73829104"
              />
            </div>
            {method !== 'bank_transfer' && (
              <div>
                <label className="text-sm text-gray-600 block mb-1">Your {info.name} Number *</label>
                <input
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  placeholder="01XXXXXXXXX"
                />
              </div>
            )}

            <button
              onClick={submitPayment}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Submitting…' : 'Submit Payment Details'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
