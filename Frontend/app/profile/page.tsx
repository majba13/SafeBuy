'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { apiFetch } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { User, MapPin, Lock, Camera, Plus, Trash2 } from 'lucide-react';

interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault?: boolean;
}

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(11),
  address: z.string().min(5),
  city: z.string().min(2),
  district: z.string().min(2),
});

type ProfileFields = z.infer<typeof profileSchema>;
type PasswordFields = z.infer<typeof passwordSchema>;
type AddressFields = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<'info' | 'addresses' | 'password'>('info');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const TABS = [
    { key: 'info', label: 'Personal Info', icon: User },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'password', label: 'Change Password', icon: Lock },
  ] as const;

  const profileForm = useForm<ProfileFields>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordFields>({ resolver: zodResolver(passwordSchema) });
  const addressForm = useForm<AddressFields>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    if (!accessToken) { router.push('/auth/login'); return; }
    apiFetch<UserProfile>('/users/me', { token: accessToken }).then((data) => {
      setProfile(data);
      setAvatarUrl(data.avatar || '');
      profileForm.reset({ name: data.name, phone: data.phone || '' });
    }).catch(() => {});
  }, [accessToken]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await apiFetch<{ url: string }>('/upload/image', { method: 'POST', body: fd, token: accessToken! });
      setAvatarUrl(res.url);
      toast.success('Avatar updated');
      await apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify({ avatar: res.url }), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
    } catch { toast.error('Failed to upload avatar'); }
    finally { setUploadingAvatar(false); }
  };

  const onSaveProfile = async (data: ProfileFields) => {
    try {
      await apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify(data), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      if (user) dispatch(setCredentials({ user: { ...user, name: data.name }, accessToken: accessToken!, refreshToken: '' }));
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
  };

  const onChangePassword = async (data: PasswordFields) => {
    try {
      await apiFetch('/users/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      toast.success('Password changed');
      passwordForm.reset();
    } catch { toast.error('Current password is incorrect'); }
  };

  const onSaveAddress = async (data: AddressFields) => {
    try {
      const updated = await apiFetch<UserProfile>('/users/addresses', { method: 'POST', body: JSON.stringify(data), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
      setProfile(updated);
      setShowAddressForm(false);
      addressForm.reset();
      toast.success('Address added');
    } catch { toast.error('Failed to add address'); }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const updated = await apiFetch<UserProfile>(`/users/addresses/${addressId}`, { method: 'DELETE', token: accessToken! });
      setProfile(updated);
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            {/* Avatar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden mx-auto">
                  {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : <User size={32} className="text-orange-500" />}
                </div>
                <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600">
                  {uploadingAvatar ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={13} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <p className="mt-2 font-semibold text-gray-900">{profile?.name}</p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${tab === t.key ? 'bg-orange-50 text-orange-600 font-medium border-l-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
            {tab === 'info' && (
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <h2 className="font-bold text-gray-900">Personal Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input {...profileForm.register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  {profileForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={profile?.email || ''} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input {...profileForm.register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium">Save Changes</button>
              </form>
            )}

            {tab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">My Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-1 text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">
                    <Plus size={14} /> Add Address
                  </button>
                </div>
                {showAddressForm && (
                  <form onSubmit={addressForm.handleSubmit(onSaveAddress)} className="border rounded-lg p-4 mb-4 space-y-3 bg-gray-50">
                    <h3 className="font-medium text-sm">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(['fullName', 'phone', 'city', 'district'] as const).map((f) => (
                        <div key={f}>
                          <input {...addressForm.register(f)} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                      ))}
                    </div>
                    <input {...addressForm.register('address')} placeholder="Street Address" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="text-gray-500 px-4 py-1.5 text-sm">Cancel</button>
                    </div>
                  </form>
                )}
                <div className="space-y-3">
                  {(profile?.addresses || []).length === 0 && <p className="text-gray-500 text-sm">No addresses saved yet.</p>}
                  {(profile?.addresses || []).map((addr) => (
                    <div key={addr._id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div className="text-sm">
                        <p className="font-medium">{addr.fullName} · {addr.phone}</p>
                        <p className="text-gray-600">{addr.address}</p>
                        <p className="text-gray-600">{addr.city}, {addr.district}</p>
                        {addr.isDefault && <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <button onClick={() => addr._id && deleteAddress(addr._id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'password' && (
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <h2 className="font-bold text-gray-900">Change Password</h2>
                {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
                    <input {...passwordForm.register(f)} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {passwordForm.formState.errors[f] && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors[f]?.message}</p>}
                  </div>
                ))}
                <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium">Update Password</button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
