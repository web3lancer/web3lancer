// 'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DisputeVoting } from '@/components/projects/DisputeVoting';
import { useAbstraxionAccount, useAbstraxionClient } from '@burnt-labs/abstraxion';
import { getXionContractAddress, getDisputeMsg } from '@/utils/xionContractUtils';
import { Metadata } from 'next';

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
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const [hasDispute, setHasDispute] = useState<boolean>(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!queryClient) return;

      try {
        const projectData = await queryClient.queryContractSmart(
          getXionContractAddress(),
          { get_project: { id: parseInt(params.id) } }
        );
        setProject(projectData);
      } catch (err) {
        console.error('Failed to fetch project details', err);
      }
    };

    fetchProjectDetails();
  }, [params.id, queryClient]);

  useEffect(() => {
    const checkDispute = async () => {
      if (!queryClient) return;

      const contractAddress = getXionContractAddress();
      if (!contractAddress) return;

      try {
        const disputeData = await queryClient.queryContractSmart(
          contractAddress,
          getDisputeMsg(parseInt(params.id))
        );

        setHasDispute(!!disputeData && disputeData.status !== 'Resolved');
      } catch (err) {
        console.log('No active dispute for this project');
        setHasDispute(false);
      }
    };

    checkDispute();
  }, [params.id, queryClient]);

  return (
    <div>
      {/* Project details content... */}
      {project && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </Box>
      )}

      {/* Add DisputeVoting component right before the project actions/tabs */}
      {hasDispute && project && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <DisputeVoting 
            projectId={parseInt(params.id)}
            clientName={project.clientName || 'Client'}
            clientAvatar={project.clientAvatar}
            freelancerName={project.freelancerName || 'Freelancer'}
            freelancerAvatar={project.freelancerAvatar}
          />
        </Box>
      )}

      {/* Project actions/tabs... */}
    </div>
  );
}