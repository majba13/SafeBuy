import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { login } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import AnimatedButton from '../../components/AnimatedButton';

export default function Login() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(login({ email, password }) as any);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input className="border p-2 w-full mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <AnimatedButton type="submit" disabled={status==='loading'}>Login</AnimatedButton>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}
