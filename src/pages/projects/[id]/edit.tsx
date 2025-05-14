import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProjectForm from '@/components/project/ProjectForm';
import projectService from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types';

interface EditProjectPageProps {
  projectId: string;
  project?: Project;
}

const EditProjectPage: NextPage<EditProjectPageProps> = ({ 
  projectId, 
  project 
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
  
  if (!project) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Project not found or you don't have permission to edit it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Project | Web3Lancer</title>
        <meta name="description" content="Edit your project on Web3Lancer" />
      </Head>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <ProjectForm
          initialProject={project}
          isEditing={true}
          onSubmitSuccess={(projectId) => {
            router.push(`/projects/${projectId}`);
          }}
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
    
    return {
      props: {
        projectId: id,
        project: JSON.parse(JSON.stringify(project))
      }
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    
    return {
      props: {
        projectId: id
      }
    };
  }
};

export default EditProjectPage;