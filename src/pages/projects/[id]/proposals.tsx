import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProposalList from '@/components/project/ProposalList';
import projectService from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { Project, Proposal } from '@/types';

interface ProjectProposalsPageProps {
  projectId: string;
  project?: Project;
  proposals?: Proposal[];
}

const ProjectProposalsPage: NextPage<ProjectProposalsPageProps> = ({ 
  projectId, 
  project, 
  proposals 
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if user is not logged in
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${router.asPath}`);
    }
  }, [user, isLoading, router]);

  // Redirect if user is not the project owner
  React.useEffect(() => {
    if (!isLoading && user && project && user.userId !== project.clientId) {
      router.push(`/projects/${projectId}`);
    }
  }, [user, isLoading, project, router, projectId]);
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project ? `Proposals for ${project.title} | Web3Lancer` : 'Project Proposals | Web3Lancer'}</title>
        <meta name="description" content="Manage proposals for your project on Web3Lancer" />
      </Head>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <ProposalList 
          projectId={projectId} 
          initialProject={project} 
          initialProposals={proposals} 
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  
  if (!id || typeof id !== 'string') {
    return {
      notFound: true
    };
  }

  try {
    // Fetch project
    const project = await projectService.getProject(id);
    
    if (!project) {
      return {
        notFound: true
      };
    }
    
    // Get user ID from session if available
    const userId = context.req.cookies?.userId;
    
    // If no user ID or user is not the project client, don't fetch proposals
    if (!userId || userId !== project.clientId) {
      return {
        props: {
          projectId: id,
          project: JSON.parse(JSON.stringify(project)),
        }
      };
    }
    
    // Fetch proposals
    const proposals = await projectService.getProjectProposals(id);
    
    return {
      props: {
        projectId: id,
        project: JSON.parse(JSON.stringify(project)),
        proposals: JSON.parse(JSON.stringify(proposals))
      }
    };
  } catch (error) {
    console.error('Error fetching project proposals:', error);
    
    return {
      props: {
        projectId: id
      }
    };
  }
};

export default ProjectProposalsPage;