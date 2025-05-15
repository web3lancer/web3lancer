import { useState } from 'react';
import { contractService } from '@/services/contract.service';
import { Contract } from '@/types';
import { toast } from 'react-hot-toast';

interface AddMilestoneFormProps {
  contractId: string;
  onMilestoneAdded: (updatedContract: Contract) => void;
}

export const AddMilestoneForm = ({ contractId, onMilestoneAdded }: AddMilestoneFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.amount.trim() || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const milestone = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      };
      
      const updatedContract = await contractService.addMilestone(contractId, milestone);
      
      if (updatedContract) {
        onMilestoneAdded(updatedContract);
        setFormData({
          title: '',
          description: '',
          amount: '',
          dueDate: ''
        });
        toast.success('Milestone added successfully');
      } else {
        toast.error('Failed to add milestone');
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('An error occurred while adding the milestone');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Milestone</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Milestone title"
          />
        </div>
        
        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Describe what needs to be delivered for this milestone"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="amount" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Amount* (USD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label 
              htmlFor="dueDate" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Milestone'}
          </button>
        </div>
      </form>
    </div>
  );
};