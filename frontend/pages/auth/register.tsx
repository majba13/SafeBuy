import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { register } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import AnimatedButton from '../../components/AnimatedButton';

export default function Register() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(register({ email, password, name }) as any);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <input className="border p-2 w-full mb-2" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input className="border p-2 w-full mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <AnimatedButton type="submit" disabled={status==='loading'}>Register</AnimatedButton>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}
