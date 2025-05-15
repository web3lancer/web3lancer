import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import projectService from '@/services/projectService';
import profileService from '@/services/profileService';
import { Project, Proposal, Profile } from '@/types';

interface ProposalListProps {
  projectId: string;
  initialProposals?: Proposal[];
  initialProject?: Project;
}

const ProposalList: React.FC<ProposalListProps> = ({ 
  projectId,
  initialProposals,
  initialProject
}) => {
  const { user } = useAuth();
  
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals || []);
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [freelancerProfiles, setFreelancerProfiles] = useState<Record<string, Profile | null>>({});
  const [loading, setLoading] = useState<boolean>(!initialProposals || !initialProject);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    if (!initialProject || !initialProposals) {
      fetchData();
    } else {
      // Load freelancer profiles for existing proposals
      loadFreelancerProfiles(initialProposals);
    }
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch project
      const projectData = await projectService.getProject(projectId);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
      
      // Check if current user is the project client
      if (user && projectData.clientId !== user.userId) {
        setError('You do not have permission to view these proposals');
        return;
      }
      
      // Fetch proposals
      const proposalData = await projectService.getProjectProposals(projectId);
      setProposals(proposalData);
      
      // Load freelancer profiles
      loadFreelancerProfiles(proposalData);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFreelancerProfiles = async (proposalsList: Proposal[]) => {
    const profilePromises = proposalsList.map(async (proposal) => {
      try {
        if (proposal.freelancerId) {
          const profile = await profileService.getProfile(proposal.freelancerId);
          return { id: proposal.freelancerId, profile };
        }
        return { id: proposal.freelancerId || '', profile: null };
      } catch (err) {
        console.error(`Error fetching profile for ${proposal.freelancerId}:`, err);
        return { id: proposal.freelancerId || '', profile: null };
      }
    });
    
    const profiles = await Promise.all(profilePromises);
    const profilesMap = profiles.reduce((acc, { id, profile }) => {
      acc[id] = profile;
      return acc;
    }, {} as Record<string, Profile | null>);
    
    setFreelancerProfiles(profilesMap);
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleStatusChange = async (proposalId: string, newStatus: Proposal['status']) => {
    try {
      const updatedProposal = await projectService.updateProposalStatus(proposalId, newStatus);
      
      if (updatedProposal) {
        // Update local state
        setProposals(prev => prev.map(p => 
          p.$id === proposalId ? { ...p, status: newStatus } : p
        ));
        
        // Update selected proposal if it's the one being changed
        if (selectedProposal && selectedProposal.$id === proposalId) {
          setSelectedProposal({ ...selectedProposal, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Error updating proposal status:', err);
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

  // Calculate total from milestones or use proposedBudget
  const calculateTotal = (proposal: Proposal) => {
    if (proposal.milestones && proposal.milestones.length > 0) {
      return proposal.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    }
    return proposal.proposedBudget || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error}
        </h3>
        <Link href="/projects" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Project not found
        </h3>
        <Link href="/projects" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Browse all projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Proposals for {project.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'} received
            </p>
          </div>
          
          <Link 
            href={`/projects/${projectId}`} 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md"
          >
            Back to Project
          </Link>
        </div>
      </div>
      
      {proposals.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No proposals yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your project hasn't received any proposals yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Proposals List */}
          <div className="md:col-span-1 space-y-4">
            {proposals.map(proposal => {
              const freelancer = freelancerProfiles[proposal.freelancerId || ''];
              
              return (
                <div 
                  key={proposal.$id}
                  onClick={() => handleViewProposal(proposal)}
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 cursor-pointer transition-colors ${
                    selectedProposal && selectedProposal.$id === proposal.$id
                      ? 'border-2 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex-shrink-0">
                      {freelancer?.avatarFileId && (
                        <img 
                          src={profileService.getProfileAvatarUrl(freelancer.avatarFileId)} 
                          alt={freelancer.displayName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white truncate">
                        {freelancer?.displayName || 'Unknown Freelancer'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${calculateTotal(proposal).toFixed(2)} • {formatDate(proposal.createdAt)}
                      </p>
                    </div>
                    <div className={`
                      px-2 py-1 text-xs rounded-full 
                      ${proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                      ${proposal.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                      ${proposal.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                    `}>
                      {proposal.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Proposal Details */}
          <div className="md:col-span-2">
            {selectedProposal ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
                {/* Proposal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Proposal from {freelancerProfiles[selectedProposal.freelancerId || '']?.displayName || 'Unknown Freelancer'}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Submitted on {formatDate(selectedProposal.createdAt)}
                      </p>
                    </div>
                    <div className={`
                      px-3 py-1 text-sm rounded-full font-medium
                      ${selectedProposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                      ${selectedProposal.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                      ${selectedProposal.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                    `}>
                      {selectedProposal.status}
                    </div>
                  </div>
                  
                  {selectedProposal.status === 'pending' && (
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleStatusChange(selectedProposal.$id, 'accepted')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedProposal.$id, 'rejected')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        Reject Proposal
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Proposal Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Proposed Budget
                      </h3>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        ${calculateTotal(selectedProposal).toFixed(2)} USD
                      </p>
                    </div>
                    
                    {selectedProposal.proposedDuration && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Estimated Duration
                        </h3>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {selectedProposal.proposedDuration.value} {selectedProposal.proposedDuration.unit}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Cover Letter */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                      Cover Letter
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {selectedProposal.coverLetter}
                      </p>
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  {selectedProposal.milestones && selectedProposal.milestones.length > 0 && (
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                        Proposed Milestones
                      </h3>
                      <div className="space-y-3">
                        {selectedProposal.milestones.map((milestone, idx) => (
                          <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  {milestone.title}
                                </h4>
                                {milestone.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {milestone.description}
                                  </p>
                                )}
                              </div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                ${milestone.amount?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Accept Proposal Button */}
                  {initialProject && selectedProposal && 
                   initialProject.clientId === user?.userId && 
                   initialProject.status === 'open' && 
                   selectedProposal.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          if (selectedProposal.$id) {
                            setAcceptingProposal(selectedProposal.$id);
                            handleAcceptProposal(selectedProposal.$id);
                          }
                        }}
                        disabled={!!acceptingProposal}
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {acceptingProposal === selectedProposal.$id ? 'Accepting...' : 'Accept Proposal & Create Contract'}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Accepting this proposal will create a contract and change the project status to "In Progress".
                      </p>
                    </div>
                  )}
                  
                  {/* Freelancer Information */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      About the Freelancer
                    </h3>
                    
                    {freelancerProfiles[selectedProposal.freelancerId || ''] ? (
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 rounded-full bg-gray-200 mr-4">
                            {freelancerProfiles[selectedProposal.freelancerId || '']?.avatarFileId && (
                              <img 
                                src={profileService.getProfileAvatarUrl(
                                  freelancerProfiles[selectedProposal.freelancerId || '']?.avatarFileId || ''
                                )} 
                                alt={freelancerProfiles[selectedProposal.freelancerId || '']?.displayName}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {freelancerProfiles[selectedProposal.freelancerId || '']?.displayName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{freelancerProfiles[selectedProposal.freelancerId || '']?.username}
                            </p>
                          </div>
                        </div>
                        
                        {freelancerProfiles[selectedProposal.freelancerId || '']?.bio && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {freelancerProfiles[selectedProposal.freelancerId || '']?.bio}
                          </p>
                        )}
                        
                        <Link 
                          href={`/profile/${freelancerProfiles[selectedProposal.freelancerId || '']?.username}`} 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Full Profile
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        Freelancer profile information unavailable
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a proposal
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Click on a proposal from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalList;