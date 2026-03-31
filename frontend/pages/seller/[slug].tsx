import { useRouter } from 'next/router';

export default function SellerStorePage() {
  const router = useRouter();
  const { slug } = router.query;
  return <div>Seller Store: {slug} (to be implemented)</div>;
}
