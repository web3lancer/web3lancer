import { useParams } from 'next/navigation';

export default function V1PostLikePage() {
  // @ts-ignore
  const params = useParams();
  return <div>V1 Post Like Page: {params?.postId}</div>;
}
