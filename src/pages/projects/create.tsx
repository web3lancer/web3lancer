import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProjectForm from '@/components/project/ProjectForm';
import { useAuth } from '@/context/AuthContext';

const CreateProjectPage: NextPage = () => {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if user is not logged in
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/projects/create');
    }
  }, [user, isLoading, router]);

  // Redirect if user is not a client
  React.useEffect(() => {
    if (profile && !profile.roles.includes('client')) {
      router.push('/profile/edit?role=client');
    }
  }, [profile, router]);
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Please log in to create a project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Project | Web3Lancer</title>
        <meta name="description" content="Post a new project on Web3Lancer" />
      </Head>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <ProjectForm
          onSubmitSuccess={(projectId) => {
            router.push(`/projects/${projectId}`);
          }}
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This is just to enable server-side rendering
  return {
    props: {}
  };
};

export default CreateProjectPage;