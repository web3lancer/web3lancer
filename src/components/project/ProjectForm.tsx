import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import projectService from '@/services/projectService';
import { Project } from '@/types';

// Categories list for selection
const CATEGORIES = [
  'Development', 'Design', 'Marketing', 'Writing', 'Admin Support',
  'Blockchain', 'Smart Contracts', 'NFT', 'DeFi', 'DAO', 'Metaverse'
];

interface ProjectFormProps {
  initialProject?: Partial<Project>;
  isEditing?: boolean;
  onSubmitSuccess?: (projectId: string) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  initialProject = {},
  isEditing = false,
  onSubmitSuccess
}) => {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: initialProject.title || '',
    description: initialProject.description || '',
    category: initialProject.category || '',
    budgetMin: initialProject.budget?.min?.toString() || '',
    budgetMax: initialProject.budget?.max?.toString() || '',
    budgetCurrency: initialProject.budget?.currency || 'USD',
    skills: initialProject.skills || [] as string[],
    newSkill: '',
    durationType: initialProject.duration?.unit || 'days',
    durationValue: initialProject.duration?.value?.toString() || '',
    location: initialProject.location || '',
    visibility: initialProject.visibility || 'public',
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(initialProject.attachments || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      router.push('/login?redirect=' + router.asPath);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (fileId: string) => {
    setExistingAttachments(prev => prev.filter(id => id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      setError('You must be logged in to create or edit a project');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Format the project data
      const projectData: Partial<Project> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: {
          min: parseInt(formData.budgetMin) || 0,
          max: parseInt(formData.budgetMax) || 0,
          currency: formData.budgetCurrency
        },
        skills: formData.skills,
        duration: formData.durationValue 
          ? {
              value: parseInt(formData.durationValue),
              unit: formData.durationType as 'hours' | 'days' | 'weeks' | 'months'
            }
          : undefined,
        location: formData.location,
        visibility: formData.visibility as 'public' | 'private' | 'invite',
        status: isEditing ? initialProject.status : 'open',
        clientId: user.userId,
        clientProfileId: profile.$id,
        // Keep existing attachments if editing
        attachments: isEditing ? existingAttachments : []
      };

      let projectId: string;
      
      if (isEditing && initialProject.$id) {
        // Update existing project
        const updatedProject = await projectService.updateProject(
          initialProject.$id,
          projectData
        );
        
        if (!updatedProject) {
          throw new Error('Failed to update project');
        }
        
        projectId = updatedProject.$id;
        setMessage('Project updated successfully!');
      } else {
        // Create new project
        const newProject = await projectService.createProject(projectData);
        
        if (!newProject) {
          throw new Error('Failed to create project');
        }
        
        projectId = newProject.$id;
        setMessage('Project created successfully!');
      }

      // Upload attachments
      if (attachments.length > 0) {
        for (const file of attachments) {
          await projectService.uploadProjectAttachment(projectId, file);
        }
      }

      // Delete removed existing attachments
      if (isEditing && initialProject.attachments) {
        const attachmentsToDelete = initialProject.attachments.filter(
          id => !existingAttachments.includes(id)
        );
        
        for (const fileId of attachmentsToDelete) {
          await projectService.deleteProjectAttachment(projectId, fileId);
        }
      }

      // Handle successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess(projectId);
      } else {
        // Redirect to project page
        router.push(`/projects/${projectId}`);
      }
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.message || 'Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to create or edit a project.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Edit Project' : 'Create New Project'}
      </h1>
      
      {(error || message) && (
        <div className={`p-3 rounded ${
          error ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
        }`}>
          {error || message}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., 'Build a Web3 Marketplace'"
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Describe your project in detail, including requirements and deliverables"
          />
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Budget*
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                id="budgetMin"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                required
                min="0"
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <input
                type="number"
                id="budgetMax"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
                required
                min="0"
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <select
                id="budgetCurrency"
                name="budgetCurrency"
                value={formData.budgetCurrency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected Duration
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                id="durationValue"
                name="durationValue"
                value={formData.durationValue}
                onChange={handleChange}
                min="1"
                placeholder="Duration"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <select
                id="durationType"
                name="durationType"
                value={formData.durationType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., 'Remote', 'New York', etc."
          />
        </div>
        
        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Required Skills
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              id="newSkill"
              name="newSkill"
              value={formData.newSkill}
              onChange={handleChange}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full flex items-center text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Visibility
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="public"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="public" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Public - Visible to everyone
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="private"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="private" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Private - Only visible to you and invited freelancers
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="invite"
                name="visibility"
                value="invite"
                checked={formData.visibility === 'invite'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="invite" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Invite-only - Only invited freelancers can view and apply
              </label>
            </div>
          </div>
        </div>
        
        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Attachments
          </label>
          
          {/* Existing attachments (when editing) */}
          {isEditing && existingAttachments.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Attachments:</p>
              <ul className="space-y-1">
                {existingAttachments.map((fileId, idx) => (
                  <li key={fileId} className="flex items-center justify-between">
                    <a 
                      href={projectService.getProjectAttachmentUrl(fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      Attachment {idx + 1}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAttachment(fileId)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* New attachments */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4">
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="attachments"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Click to upload or drag and drop files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
            </label>
          </div>
          
          {/* Selected files display */}
          {attachments.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Selected Files:</p>
              <ul className="space-y-1">
                {attachments.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : isEditing ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;