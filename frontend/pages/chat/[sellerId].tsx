import { useRouter } from 'next/router';

export default function ChatWithSeller() {
  const router = useRouter();
  const { sellerId } = router.query;
  return <div>Chat with Seller {sellerId} (to be implemented)</div>;
}
