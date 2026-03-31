import { useRouter } from 'next/router';

export default function ProductDetails() {
  const router = useRouter();
  const { slug } = router.query;
  return <div>Product Details for {slug} (to be implemented)</div>;
}
