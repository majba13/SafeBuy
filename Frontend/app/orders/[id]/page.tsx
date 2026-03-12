'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Calendar, RefreshCw } from 'lucide-react';

interface TrackingEvent {
  timestamp: string;
  description: string;
  location?: string;
}

interface ShipmentInfo {
  status: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  events?: TrackingEvent[];
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingCost: number;
  couponDiscount?: number;
  shippingAddress: { fullName: string; phone: string; address: string; city: string; district: string };
  items: {
    product: { _id: string; title: string; images: string[] };
    quantity: number;
    price: number;
    status: string;
    trackingNumber?: string;
    courier?: string;
  }[];
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const COURIER_LABELS: Record<string, string> = {
  pathao: 'Pathao Courier',
  steadfast: 'Steadfast',
  paperfly: 'Paperfly',
  redx: 'RedX',
  sundarban: 'Sundarban',
  manual: 'Standard Delivery',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAppSelector((s) => s.auth);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shipment, setShipment] = useState<ShipmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || !id) return;
    apiFetch<OrderDetail>(`/orders/${id}`, { token: accessToken })
      .then((data) => {
        setOrder(data);
        if (['shipped', 'delivered'].includes(data.status)) {
          return apiFetch<ShipmentInfo>(`/delivery/order/${id}`, { token: accessToken })
            .then(setShipment)
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const refreshTracking = async () => {
    if (!id || !accessToken) return;
    setTrackingLoading(true);
    try {
      const data = await apiFetch<ShipmentInfo>(`/delivery/order/${id}`, { token: accessToken });
      setShipment(data);
    } catch { /* silently ignore */ }
    finally { setTrackingLoading(false); }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === order?.status);
  const isCancelled = order?.status === 'cancelled' || order?.status === 'returned';

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="text-center py-20 text-gray-500">Order not found.</div>
        <Footer />
      </>
    );
  }

  const courier = shipment?.courier ?? order.items[0]?.courier ?? order.courier;
  const trackingNumber = shipment?.trackingNumber ?? order.items[0]?.trackingNumber ?? order.trackingNumber;
  const estimatedDelivery = shipment?.estimatedDelivery ?? order.estimatedDelivery;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-BD')}</p>
          </div>
          <Link href="/orders" className="text-sm text-orange-500 hover:underline">← All Orders</Link>
        </div>

        {/* Status tracker */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {isCancelled ? (
            <div className="flex items-center gap-3 text-red-500">
              <XCircle size={24} />
              <span className="font-semibold capitalize">{order.status === 'returned' ? 'Order Returned' : 'Order Cancelled'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {i < STEPS.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-0.5 ${i < stepIndex ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'} ${active ? 'ring-4 ring-orange-200' : ''}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs mt-2 text-center text-gray-600">{step.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ETA Banner — visible when shipped */}
        {estimatedDelivery && !isCancelled && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 mb-6 flex flex-wrap items-center gap-3">
            <Calendar className="text-orange-500 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800">Estimated Delivery</p>
              <p className="text-xs text-orange-600">{new Date(estimatedDelivery).toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            {courier && (
              <span className="text-xs bg-orange-100 text-orange-700 font-medium px-3 py-1 rounded-full">
                {COURIER_LABELS[courier] ?? courier}
              </span>
            )}
          </div>
        )}

        {/* Tracking card — when shipped */}
        {(courier || trackingNumber) && !isCancelled && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Shipment Tracking</h2>
              <button onClick={refreshTracking} disabled={trackingLoading} className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 disabled:opacity-50">
                <RefreshCw size={13} className={trackingLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              {courier && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Courier</p>
                  <p className="font-semibold text-gray-800">{COURIER_LABELS[courier] ?? courier}</p>
                </div>
              )}
              {trackingNumber && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tracking #</p>
                  <p className="font-mono font-semibold text-gray-800">{trackingNumber}</p>
                </div>
              )}
              {shipment?.status && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Courier Status</p>
                  <p className="font-semibold text-gray-800 capitalize">{shipment.status}</p>
                </div>
              )}
            </div>

            {/* Event timeline */}
            {shipment?.events && shipment.events.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tracking History</p>
                <div className="space-y-3">
                  {shipment.events.map((ev, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${i === 0 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                        {i < shipment.events!.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="font-medium text-gray-800">{ev.description}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span>{new Date(ev.timestamp).toLocaleString('en-BD')}</span>
                          {ev.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin size={10} />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Items ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.product?.title}</p>
                    <p className="text-gray-500">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                  </div>
                  <span className="font-bold text-orange-600">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + Address */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Payment</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Method</span>
                  <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>৳{order.shippingCost.toLocaleString()}</span>
                </div>
                {order.couponDiscount && order.couponDiscount > 0 ? (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon</span>
                    <span>-৳{order.couponDiscount.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span className="text-orange-600">৳{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
