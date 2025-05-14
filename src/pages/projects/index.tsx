import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import ProjectListing from '@/components/project/ProjectListing';
import projectService from '@/services/projectService';
import { Project } from '@/types';

interface ProjectsPageProps {
  initialProjects: Project[];
  initialTotal: number;
}

const ProjectsPage: NextPage<ProjectsPageProps> = ({ initialProjects, initialTotal }) => {
  return (
    <>
      <Head>
        <title>Browse Projects | Web3Lancer</title>
        <meta name="description" content="Browse freelance projects in the Web3 ecosystem" />
      </Head>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Browse Projects
        </h1>
        
        <ProjectListing 
          initialProjects={initialProjects} 
          initialTotal={initialTotal} 
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Extract query parameters
    const { query, skills, minBudget, maxBudget, category } = context.query;
    
    // Convert query parameters to the format expected by the service
    const searchParams: any = {
      page: 1,
      limit: 10
    };
    
    if (query && typeof query === 'string') {
      searchParams.query = query;
    }
    
    if (skills) {
      searchParams.skills = Array.isArray(skills) ? skills : [skills];
    }
    
    if (minBudget && typeof minBudget === 'string') {
      searchParams.minBudget = parseInt(minBudget);
    }
    
    if (maxBudget && typeof maxBudget === 'string') {
      searchParams.maxBudget = parseInt(maxBudget);
    }
    
    if (category && typeof category === 'string') {
      searchParams.category = category;
    }
    
    // Fetch projects based on query parameters
    const { projects, total } = await projectService.searchProjects(searchParams);
    
    return {
      props: {
        initialProjects: JSON.parse(JSON.stringify(projects)),
        initialTotal: total
      }
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Return empty array on error
    return {
      props: {
        initialProjects: [],
        initialTotal: 0
      }
    };
  }
};

export default ProjectsPage;