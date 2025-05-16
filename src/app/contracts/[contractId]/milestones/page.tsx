"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import contractService from '@/services/contractService';
import { Contract, Milestone } from '@/types';
import { formatDate } from '@/lib/utils';
import MilestoneCard from '@/components/contracts/MilestoneCard';

interface MilestoneFormData {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
}

interface MilestonesPageProps {
  params: {
    contractId: string;
  };
}

export default function MilestonesPage({ params }: MilestonesPageProps) {
  const { contractId } = params;
  const router = useRouter();
  const { user } = useAuth();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAddingMilestone, setIsAddingMilestone] = useState<boolean>(false);
  const [formData, setFormData] = useState<MilestoneFormData>({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user || !contractId) return;
      
      try {
        setLoading(true);
        
        // Fetch contract details
        const contractData = await contractService.getContract(contractId);
        
        if (!contractData) {
          setError('Contract not found.');
          return;
        }
        
        // Check if user is part of this contract
        if (contractData.clientId !== user.userId && contractData.freelancerId !== user.userId) {
          setError('You do not have permission to view this contract.');
          return;
        }
        
        setContract(contractData);
        
        // Fetch milestones for this contract
        const contractMilestones = await contractService.getMilestonesByContractId(contractId);
        setMilestones(contractMilestones);
        
      } catch (error) {
        console.error('Error fetching contract details:', error);
        setError('Failed to fetch contract details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [contractId, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract) return;
    
    try {
      const milestoneData: Partial<Milestone> = {
        contractId: contract.$id,
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate || undefined,
        status: 'pending',
      };
      
      const newMilestone = await contractService.createMilestone(milestoneData);
      
      if (newMilestone) {
        setMilestones([...milestones, newMilestone]);
        setIsAddingMilestone(false);
        setFormData({
          title: '',
          description: '',
          amount: '',
          dueDate: '',
        });
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      alert('Failed to create milestone. Please try again.');
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, status: Milestone['status']) => {
    try {
      const updatedMilestone = await contractService.updateMilestoneStatus(milestoneId, status);
      
      if (updatedMilestone) {
        setMilestones(milestones.map(milestone => 
          milestone.$id === updatedMilestone.$id ? updatedMilestone : milestone
        ));
      }
    } catch (error) {
      console.error('Error updating milestone status:', error);
      alert('Failed to update milestone status. Please try again.');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      const success = await contractService.deleteMilestone(milestoneId);
      
      if (success) {
        setMilestones(milestones.filter(milestone => milestone.$id !== milestoneId));
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Failed to delete milestone. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">Loading milestones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 text-red-500">{error}</div>
        <div className="text-center">
          <Link href="/contracts" className="text-blue-600 hover:underline">
            Return to Contracts
          </Link>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">Contract not found.</div>
        <div className="text-center">
          <Link href="/contracts" className="text-blue-600 hover:underline">
            Return to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const isClient = contract.clientId === user?.userId;
  const userRole = isClient ? 'client' : 'freelancer';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/contracts/${contractId}`} className="text-blue-600 hover:underline">
          ← Back to Contract
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Milestones: {contract.title}</h1>
        
        {isClient && contract.status !== 'completed' && contract.status !== 'cancelled' && (
          <button
            onClick={() => setIsAddingMilestone(!isAddingMilestone)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            {isAddingMilestone ? 'Cancel' : 'Add Milestone'}
          </button>
        )}
      </div>
      
      {/* Add Milestone Form */}
      {isAddingMilestone && isClient && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Milestone</h2>
          
          <form onSubmit={handleAddMilestone}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Milestone
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Milestones List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Milestones</h2>
        
        {milestones.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No milestones have been added to this contract yet.</p>
            {isClient && (
              <button
                onClick={() => setIsAddingMilestone(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Your First Milestone
              </button>
            )}
          </div>
        ) : (
          <div>
            {milestones.map(milestone => (
              <MilestoneCard
                key={milestone.$id}
                milestone={milestone}
                userRole={userRole}
                onStatusUpdate={handleUpdateMilestoneStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}