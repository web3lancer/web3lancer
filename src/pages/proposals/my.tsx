import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import projectService from '@/services/projectService';
import { Proposal, Project } from '@/types';

const MyProposalsPage: NextPage = () => {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  
  const [proposals, setProposals] = useState<(Proposal & { project?: Project })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/proposals/my');
    }
  }, [user, isLoading, router]);

  // Fetch proposals
  useEffect(() => {
    if (user && !isLoading) {
      fetchProposals();
    }
  }, [user, isLoading]);

  const fetchProposals = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const proposalData = await projectService.getProposalsByFreelancerId(user.userId);
      
      // Fetch associated projects
      const proposalsWithProjects = await Promise.all(
        proposalData.map(async (proposal) => {
          try {
            const project = await projectService.getProject(proposal.projectId);
            return { ...proposal, project };
          } catch (err) {
            console.error(`Error fetching project for proposal ${proposal.$id}:`, err);
            return proposal;
          }
        })
      );
      
      setProposals(proposalsWithProjects);
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      setError(err.message || 'Failed to load your proposals');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge style
  const getStatusBadgeClass = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Please log in to view your proposals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Proposals | Web3Lancer</title>
        <meta name="description" content="Manage your project proposals on Web3Lancer" />
      </Head>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Proposals
          </h1>
          
          <Link 
            href="/projects" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Find More Projects
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {proposals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              You haven't submitted any proposals yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Browse available projects and submit proposals to start working on exciting Web3 projects.
            </p>
            <Link 
              href="/projects" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map(proposal => (
              <div 
                key={proposal.$id} 
                className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {proposal.project ? (
                          <Link 
                            href={`/projects/${proposal.projectId}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {proposal.project.title}
                          </Link>
                        ) : (
                          `Project (ID: ${proposal.projectId})`
                        )}
                      </h2>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Submitted on {formatDate(proposal.createdAt)}
                      </p>
                      
                      {proposal.project && (
                        <div className="mt-2">
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm">
                            {proposal.project.description}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(proposal.status)}`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                      
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-2">
                        ${(proposal.proposedBudget || 0).toFixed(2)}
                      </p>
                      
                      {proposal.proposedDuration && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {proposal.proposedDuration.value} {proposal.proposedDuration.unit}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                      Your Cover Letter
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {proposal.coverLetter}
                    </p>
                  </div>
                  
                  {proposal.status === 'pending' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to withdraw this proposal?')) {
                            try {
                              await projectService.updateProposalStatus(proposal.$id, 'withdrawn');
                              // Update local state
                              setProposals(prevProposals => 
                                prevProposals.map(p => 
                                  p.$id === proposal.$id ? { ...p, status: 'withdrawn' } : p
                                )
                              );
                            } catch (err) {
                              console.error('Error withdrawing proposal:', err);
                              alert('Failed to withdraw proposal. Please try again.');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        Withdraw Proposal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyProposalsPage;