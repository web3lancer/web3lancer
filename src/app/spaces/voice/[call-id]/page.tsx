import { useParams } from 'next/navigation';

export default function SpacesVoiceCallPage() {
  // @ts-ignore
  const params = useParams();
  return <div>Spaces Voice Call Page: {params?.['call-id']}</div>;
}
