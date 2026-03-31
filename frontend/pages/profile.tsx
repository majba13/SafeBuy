import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import FadeIn from '../components/FadeIn';
import Avatar from '../components/Avatar';

export default function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user) return <FadeIn><div className="p-8">Not logged in.</div></FadeIn>;
  return (
    <FadeIn>
      <div className="max-w-md mx-auto p-8 flex flex-col items-center">
        <Avatar src={user.avatar} alt={user.name} size={72} />
        <h1 className="text-2xl font-bold mb-4 mt-2">{user.name}</h1>
        <div className="mb-1">Email: {user.email}</div>
        <div className="mb-1">Role: {user.role}</div>
      </div>
    </FadeIn>
  );
}
