import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import projectService from '@/services/projectService';
import profileService from '@/services/profileService';
import { Project, Profile } from '@/types';
import ProposalForm from './ProposalForm';

interface ProjectDetailProps {
  projectId: string;
  initialProject?: Project;
  initialClientProfile?: Profile;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  projectId,
  initialProject,
  initialClientProfile
}) => {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [clientProfile, setClientProfile] = useState<Profile | null>(initialClientProfile || null);
  const [loading, setLoading] = useState<boolean>(!initialProject);
  const [error, setError] = useState<string | null>(null);
  const [showProposalForm, setShowProposalForm] = useState<boolean>(false);

  useEffect(() => {
    if (!initialProject) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const projectData = await projectService.getProject(projectId);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
      
      // Fetch client profile if not provided
      if (!initialClientProfile && projectData.clientId) {
        const clientData = await profileService.getProfile(projectData.clientId);
        setClientProfile(clientData);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details. Please try again.');
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

  // Check if the current user is the client who posted this project
  const isClientUser = user && project && user.userId === project.clientId;
  
  // Check if current user can apply (freelancer, not the client, and project is open)
  const canApply = user && profile && project && 
    !isClientUser && 
    profile.roles.includes('freelancer') &&
    project.status === 'open';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || 'Project not found'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          We couldn't find the project you're looking for.
        </p>
        <Link href="/projects" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Browse all projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Posted on {formatDate(project.createdAt)}
              </p>
            </div>
            
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-lg px-4 py-2 rounded-full">
              {project.budget.min}-{project.budget.max} {project.budget.currency}
            </div>
          </div>
          
          {/* Project Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {canApply && (
              <button
                onClick={() => setShowProposalForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
              >
                Submit Proposal
              </button>
            )}
            
            {isClientUser && (
              <>
                <Link href={`/projects/${project.$id}/edit`} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-md">
                  Edit Project
                </Link>
                <Link href={`/projects/${project.$id}/proposals`} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-md">
                  View Proposals
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Project Details & Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Project Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Project Description */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Description</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {project.description}
              </p>
            </div>
          </div>
          
          {/* Skills Required */}
          {project.skills && project.skills.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Attachments</h2>
              <ul className="space-y-2">
                {project.attachments.map((fileId, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <a 
                      href={projectService.getProjectAttachmentUrl(fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Attachment {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Sidebar - Client Information & Project Details */}
        <div className="space-y-6">
          {/* Project Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Status</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white capitalize">
                  {project.status}
                </p>
              </div>
              
              {project.duration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Duration</h3>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">
                    {project.duration.value} {project.duration.unit}
                  </p>
                </div>
              )}
              
              {project.category && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">
                    {project.category}
                  </p>
                </div>
              )}
              
              {project.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">
                    {project.location}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Client Information */}
          {clientProfile && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Client</h2>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4">
                  {clientProfile.avatarFileId && (
                    <img 
                      src={profileService.getProfileAvatarUrl(clientProfile.avatarFileId)} 
                      alt={clientProfile.displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {clientProfile.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{clientProfile.username}
                  </p>
                </div>
              </div>
              
              {clientProfile.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                  {clientProfile.bio}
                </p>
              )}
              
              <Link href={`/profile/${clientProfile.username}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                View Profile
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Proposal Form Modal */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit a Proposal</h2>
                <button 
                  onClick={() => setShowProposalForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ProposalForm 
                projectId={project.$id} 
                onSubmitSuccess={() => {
                  setShowProposalForm(false);
                  router.push('/proposals/my');
                }}
                onCancel={() => setShowProposalForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;