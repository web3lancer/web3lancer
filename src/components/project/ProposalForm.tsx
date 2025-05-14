import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import projectService from '@/services/projectService';
import { Proposal } from '@/types';

interface ProposalFormProps {
  projectId: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ 
  projectId, 
  onSubmitSuccess,
  onCancel
}) => {
  const { user, profile } = useAuth();
  
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedBudget: '',
    proposedDuration: '',
    proposedDurationType: 'days',
    milestones: [] as Array<{
      title: string;
      description: string;
      amount: string;
    }>
  });
  
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMilestoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMilestone(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.amount.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { ...newMilestone }]
      }));
      
      setNewMilestone({
        title: '',
        description: '',
        amount: ''
      });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      setError('You must be logged in to submit a proposal');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Format milestones data
      const formattedMilestones = formData.milestones.map(milestone => ({
        title: milestone.title,
        description: milestone.description,
        amount: parseFloat(milestone.amount)
      }));

      // Calculate total from milestones or use proposed budget
      const totalAmount = formattedMilestones.length > 0
        ? formattedMilestones.reduce((sum, milestone) => sum + milestone.amount, 0)
        : parseFloat(formData.proposedBudget) || 0;

      // Build proposal data
      const proposalData: Partial<Proposal> = {
        projectId,
        freelancerId: user.userId,
        freelancerProfileId: profile.$id,
        coverLetter: formData.coverLetter,
        proposedBudget: totalAmount,
        proposedDuration: formData.proposedDuration 
          ? {
              value: parseInt(formData.proposedDuration),
              unit: formData.proposedDurationType as 'hours' | 'days' | 'weeks' | 'months'
            }
          : undefined,
        milestones: formattedMilestones.length > 0 ? formattedMilestones : undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Submit proposal
      const proposal = await projectService.submitProposal(proposalData);
      
      if (!proposal) {
        throw new Error('Failed to submit proposal');
      }

      // Handle success
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      setError(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to submit a proposal.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
          {error}
        </div>
      )}
      
      {/* Cover Letter */}
      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cover Letter*
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Introduce yourself and explain why you're the right person for this project"
        />
      </div>
      
      {/* Budget and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proposed Budget */}
        <div>
          <label htmlFor="proposedBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proposed Budget* (USD)
          </label>
          <input
            type="number"
            id="proposedBudget"
            name="proposedBudget"
            value={formData.proposedBudget}
            onChange={handleChange}
            required={formData.milestones.length === 0}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Your budget for the entire project"
            disabled={formData.milestones.length > 0}
          />
          {formData.milestones.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Budget will be calculated from milestones
            </p>
          )}
        </div>
        
        {/* Proposed Duration */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="proposedDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Duration
            </label>
            <input
              type="number"
              id="proposedDuration"
              name="proposedDuration"
              value={formData.proposedDuration}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Duration"
            />
          </div>
          <div>
            <label htmlFor="proposedDurationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <select
              id="proposedDurationType"
              name="proposedDurationType"
              value={formData.proposedDurationType}
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
      
      {/* Project Milestones */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Milestones
          </label>
          <button
            type="button"
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => setFormData(prev => ({ ...prev, milestones: [] }))}
            disabled={formData.milestones.length === 0}
          >
            Clear All
          </button>
        </div>
        
        {/* Existing milestones */}
        {formData.milestones.length > 0 && (
          <div className="space-y-3 mb-4">
            {formData.milestones.map((milestone, idx) => (
              <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{milestone.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      ${parseFloat(milestone.amount).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2 text-right text-sm font-medium text-gray-800 dark:text-gray-200">
              Total: ${formData.milestones.reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0).toFixed(2)}
            </div>
          </div>
        )}
        
        {/* Add new milestone form */}
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">Add a Milestone</h4>
          
          <div>
            <input
              type="text"
              id="milestoneTitle"
              name="title"
              value={newMilestone.title}
              onChange={handleMilestoneChange}
              placeholder="Milestone Title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <textarea
              id="milestoneDescription"
              name="description"
              value={newMilestone.description}
              onChange={handleMilestoneChange}
              rows={2}
              placeholder="Milestone Description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  id="milestoneAmount"
                  name="amount"
                  value={newMilestone.amount}
                  onChange={handleMilestoneChange}
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </div>
    </form>
  );
};

export default ProposalForm;