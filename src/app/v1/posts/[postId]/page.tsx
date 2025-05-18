import { useParams } from 'next/navigation';

export default function V1PostPage() {
  // @ts-ignore
  const params = useParams();
  return <div>V1 Post Page: {params?.postId}</div>;
}
