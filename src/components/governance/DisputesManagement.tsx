import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GovernanceService from '@/services/governanceService';
import { Dispute } from '@/types/governance';

interface DisputeFormProps {
  onSubmit: (data: {
    relatedId: string;
    relatedType: 'contract' | 'proposal' | 'payment' | 'other';
    title: string;
    description: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Form for creating a new dispute
const DisputeForm: React.FC<DisputeFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [relatedId, setRelatedId] = useState<string>('');
  const [relatedType, setRelatedType] = useState<'contract' | 'proposal' | 'payment' | 'other'>('contract');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<{
    relatedId?: string;
    title?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      relatedId?: string;
      title?: string;
      description?: string;
    } = {};
    
    if (!relatedId) {
      newErrors.relatedId = 'Please enter a related ID';
    }
    
    if (!title || title.length < 5) {
      newErrors.title = 'Please enter a title (at least 5 characters)';
    }
    
    if (!description || description.length < 20) {
      newErrors.description = 'Please provide a detailed description (at least 20 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onSubmit({
      relatedId,
      relatedType,
      title,
      description
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="relatedType" className="block text-sm font-medium text-gray-700">
          Related To
        </label>
        <select
          id="relatedType"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={relatedType}
          onChange={(e) => setRelatedType(e.target.value as any)}
          disabled={isSubmitting}
        >
          <option value="contract">Contract</option>
          <option value="proposal">Proposal</option>
          <option value="payment">Payment</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="relatedId" className="block text-sm font-medium text-gray-700">
          {relatedType === 'contract' ? 'Contract ID' : 
           relatedType === 'proposal' ? 'Proposal ID' : 
           relatedType === 'payment' ? 'Payment ID' : 'Reference ID'}
        </label>
        <input
          type="text"
          id="relatedId"
          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
            errors.relatedId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          value={relatedId}
          onChange={(e) => setRelatedId(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.relatedId && (
          <p className="mt-1 text-sm text-red-600">{errors.relatedId}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
            errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
            errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide a detailed description of the issue..."
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </div>
    </form>
  );
};

interface DisputeCardProps {
  dispute: Dispute;
}

// Individual dispute card component
const DisputeCard: React.FC<DisputeCardProps> = ({ dispute }) => {
  const getStatusBadge = () => {
    switch (dispute.status) {
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Open</span>;
      case 'under_review':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Under Review</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Closed</span>;
      default:
        return null;
    }
  };

  const getRelatedTypeBadge = () => {
    switch (dispute.relatedType) {
      case 'contract':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Contract</span>;
      case 'proposal':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Proposal</span>;
      case 'payment':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Payment</span>;
      case 'other':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Other</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{dispute.title}</h3>
          {getStatusBadge()}
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {getRelatedTypeBadge()}
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            ID: {dispute.relatedId.substring(0, 8)}...
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Created: {new Date(dispute.$createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{dispute.description}</p>
        </div>
        
        {dispute.resolution && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Resolution</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{dispute.resolution}</p>
            
            {dispute.resolutionDate && (
              <p className="mt-2 text-xs text-gray-500">
                Resolved on: {new Date(dispute.resolutionDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface DisputesManagementProps {
  governanceService: GovernanceService;
}

// Main disputes management component
const DisputesManagement: React.FC<DisputesManagementProps> = ({ governanceService }) => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');

  useEffect(() => {
    const fetchDisputes = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userDisputes = await governanceService.listDisputes([
          'Query.equal("creatorId", "' + user.id + '")',
          'Query.orderDesc("$updatedAt")'
        ]);
        
        setDisputes(userDisputes);
      } catch (error) {
        console.error('Error fetching disputes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisputes();
  }, [user, governanceService]);

  const handleCreateDispute = async (data: {
    relatedId: string;
    relatedType: 'contract' | 'proposal' | 'payment' | 'other';
    title: string;
    description: string;
  }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const dispute = await governanceService.createDispute({
        creatorId: user.id,
        respondentId: '', // This would typically be set based on the related item
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        title: data.title,
        description: data.description,
        status: 'open'
      });
      
      setDisputes(prev => [dispute, ...prev]);
      setIsFormOpen(false);
      alert('Dispute submitted successfully!');
    } catch (error) {
      console.error('Error creating dispute:', error);
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisputes = activeTab === 'open'
    ? disputes.filter(d => ['open', 'under_review'].includes(d.status))
    : disputes.filter(d => ['resolved', 'closed'].includes(d.status));

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Please log in to manage disputes</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dispute Resolution</h1>
        
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Dispute
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Submit a New Dispute</h2>
          <DisputeForm
            onSubmit={handleCreateDispute}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('open')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'open'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Open Disputes
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resolved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resolved Disputes
            </button>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : filteredDisputes.length > 0 ? (
        <div className="space-y-6">
          {filteredDisputes.map(dispute => (
            <DisputeCard key={dispute.$id} dispute={dispute} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No {activeTab} disputes found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {activeTab === 'open' 
              ? 'You don\'t have any open disputes.' 
              : 'You don\'t have any resolved disputes.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DisputesManagement;