'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Store, CreditCard, CheckCircle } from 'lucide-react';

const schema = z.object({
  shopName: z.string().min(3, 'Shop name must be at least 3 characters'),
  description: z.string().min(10, 'Please describe your shop (min 10 chars)'),
  phone: z.string().min(11, 'Enter valid phone number'),
  nidNumber: z.string().min(10, 'Enter valid NID/TIN number'),
  businessType: z.enum(['individual', 'company']),
  tradeLicense: z.string().optional(),
  bkashNumber: z.string().optional(),
  nagadNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
});

type OnboardFields = z.infer<typeof schema>;

const STEPS = [
  { label: 'Shop Info', icon: Store },
  { label: 'Payment Details', icon: CreditCard },
  { label: 'Review & Submit', icon: CheckCircle },
];

export default function SellerOnboardPage() {
  const router = useRouter();
  const { accessToken } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<OnboardFields>({
    resolver: zodResolver(schema),
    defaultValues: { businessType: 'individual' },
  });

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: OnboardFields) => {
    setSubmitting(true);
    try {
      await apiFetch('/sellers/register', {
        method: 'POST',
        body: JSON.stringify(data),
        token: accessToken!,
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success('Seller application submitted! We will review it shortly.');
      router.push('/seller/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Become a Seller</h1>
        <p className="text-gray-500 mb-8">Start selling on SafeBuy and reach millions of buyers</p>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-green-500 text-white' : active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon size={18} />
                </div>
                <p className={`text-xs mt-1 ${active ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>{s.label}</p>
                {i < STEPS.length - 1 && <div className={`absolute mt-5 w-1/3 h-0.5 translate-x-12 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {/* Step 0: Shop Info */}
            {step === 0 && (
              <>
                <h2 className="font-semibold text-gray-900">Shop Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                  <input {...register('shopName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="My Awesome Shop" />
                  {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Describe what you sell…" />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="01XXXXXXXXX" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NID / TIN *</label>
                    <input {...register('nidNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {errors.nidNumber && <p className="text-red-500 text-xs mt-1">{errors.nidNumber.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                  <select {...register('businessType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="individual">Individual</option>
                    <option value="company">Company / Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade License (optional)</label>
                  <input {...register('tradeLicense')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <button type="button" onClick={next} className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600">Continue to Payment Details</button>
              </>
            )}

            {/* Step 1: Payment Details */}
            {step === 1 && (
              <>
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
                <p className="text-xs text-gray-500">Payouts will be sent to these accounts.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
                    <input {...register('bkashNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="01XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Number</label>
                    <input {...register('nagadNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="01XXXXXXXXX" />
                  </div>
                </div>
                <hr className="border-gray-100" />
                <p className="text-sm font-medium text-gray-700">Bank Transfer</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: 'bankAccountName', label: 'Account Name' },
                    { field: 'bankAccountNumber', label: 'Account Number' },
                    { field: 'bankName', label: 'Bank Name' },
                    { field: 'bankRoutingNumber', label: 'Routing Number' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input {...register(field as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={back} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Back</button>
                  <button type="button" onClick={next} className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600">Review Application</button>
                </div>
              </>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <>
                <h2 className="font-semibold text-gray-900">Review Your Application</h2>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Shop Name</span><span className="font-medium">{getValues('shopName')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{getValues('phone')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">NID/TIN</span><span>{getValues('nidNumber')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Business Type</span><span className="capitalize">{getValues('businessType')}</span></div>
                  {getValues('bkashNumber') && <div className="flex justify-between"><span className="text-gray-500">bKash</span><span>{getValues('bkashNumber')}</span></div>}
                  {getValues('bankAccountNumber') && <div className="flex justify-between"><span className="text-gray-500">Bank Acc</span><span>{getValues('bankAccountNumber')}</span></div>}
                </div>
                <p className="text-xs text-gray-400">Your application will be reviewed within 1-2 business days. You will be notified by email.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={back} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Back</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60">
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
