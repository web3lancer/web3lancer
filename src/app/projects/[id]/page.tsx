import { Metadata } from "next";
import ProjectClient from "./ProjectClient";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch project data (or use placeholder if not available)
  // You can replace this with a real fetch if needed
  const projectTitle = 'Project Details';
  const projectDescription = 'View details and dispute voting for this project on Web3Lancer.';
  const projectImage = '/logo/web3lancer.jpg';
  const url = `https://www.web3lancer.website/projects/${params.id}`;

  return {
    title: projectTitle,
    description: projectDescription,
    openGraph: {
      title: projectTitle,
      description: projectDescription,
      url,
      images: [projectImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: projectTitle,
      description: projectDescription,
      images: [projectImage],
    },
  };
}

export default function Project({ params }: { params: { id: string } }) {
  return <ProjectClient params={params} />;
}