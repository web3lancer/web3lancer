import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import ProjectDetail from '@/components/project/ProjectDetail';
import projectService from '@/services/projectService';
import profileService from '@/services/profileService';
import { Project, Profile } from '@/types';

interface ProjectPageProps {
  projectId: string;
  project?: Project;
  clientProfile?: Profile;
}

const ProjectPage: NextPage<ProjectPageProps> = ({ 
  projectId, 
  project, 
  clientProfile 
}) => {
  return (
    <>
      <Head>
        <title>{project ? `${project.title} | Web3Lancer` : 'Project Details | Web3Lancer'}</title>
        <meta 
          name="description" 
          content={project?.description?.substring(0, 160) || 'View project details on Web3Lancer'} 
        />
      </Head>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <ProjectDetail 
          projectId={projectId} 
          initialProject={project} 
          initialClientProfile={clientProfile} 
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
    
    // Fetch client profile
    let clientProfile = null;
    if (project.clientId) {
      clientProfile = await profileService.getProfile(project.clientId);
    }
    
    return {
      props: {
        projectId: id,
        project: JSON.parse(JSON.stringify(project)),
        clientProfile: clientProfile ? JSON.parse(JSON.stringify(clientProfile)) : null
      }
    };
  } catch (error) {
    console.error('Error fetching project details:', error);
    
    return {
      props: {
        projectId: id
      }
    };
  }
};

export default ProjectPage;