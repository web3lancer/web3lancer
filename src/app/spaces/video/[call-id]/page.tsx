import { useParams } from 'next/navigation';

export default function SpacesVideoCallPage() {
  // @ts-ignore
  const params = useParams();
  return <div>Spaces Video Call Page: {params?.['call-id']}</div>;
}
