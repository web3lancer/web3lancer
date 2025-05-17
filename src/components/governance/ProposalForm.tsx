import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ProposalService from '@/services/proposalService';
import { AppwriteService } from '@/services/appwriteService';
import { PlatformProposal } from '@/types/governance';
import { envConfig } from '@/config/environment';

interface ProposalFormProps {
  proposerId: string;
  onSuccess?: (proposal: PlatformProposal) => void;
  onCancel?: () => void;
}

interface FormValues {
  title: string;
  description: string;
  category: string;
  discussionThreadId?: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  proposerId,
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const [error, setError] = useState<string | null>(null);
  
  const appwriteService = new AppwriteService(envConfig);
  const proposalService = new ProposalService(appwriteService);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      
      const proposalData: Omit<PlatformProposal, '$id' | '$createdAt' | '$updatedAt' | 'yesVotes' | 'noVotes' | 'abstainVotes'> = {
        proposerId,
        title: data.title,
        description: data.description,
        category: data.category,
        status: 'draft',
        discussionThreadId: data.discussionThreadId || undefined
      };
      
      const proposal = await proposalService.createProposal(proposalData);
      
      if (!proposal) {
        throw new Error('Failed to create proposal');
      }
      
      if (onSuccess) {
        onSuccess(proposal);
      }
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal. Please try again later.');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Submit a Platform Proposal</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            className={`w-full px-3 py-2 border rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="A concise title for your proposal"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            className={`w-full px-3 py-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select a category</option>
            <option value="feature_request">Feature Request</option>
            <option value="policy_change">Policy Change</option>
            <option value="bug_fix">Bug Fix</option>
            <option value="improvement">Platform Improvement</option>
            <option value="other">Other</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            className={`w-full px-3 py-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            rows={8}
            placeholder="Provide a detailed description of your proposal, its rationale, and implementation details"
            {...register('description', { 
              required: 'Description is required',
              minLength: { value: 100, message: 'Description should be at least 100 characters' } 
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discussionThreadId">
            Discussion Thread ID (Optional)
          </label>
          <input
            id="discussionThreadId"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="ID of an existing discussion thread about this proposal"
            {...register('discussionThreadId')}
          />
          <p className="text-xs text-gray-500 mt-1">
            If there's an existing discussion about this proposal, you can link it here
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;