'use client';

import React, { useState, useEffect } from 'react';
import DisputeService from '@/services/disputeService';
import { AppwriteService } from '@/services/appwriteService';
import { Dispute } from '@/types/governance';
import DisputeCard from '@/components/governance/DisputeCard';
import DisputeForm from '@/components/governance/DisputeForm';
import { PlusIcon } from '@heroicons/react/outline';
import { useAuth } from '@/contexts/AuthContext';

const DisputesPage: React.FC = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'involved' | 'all'>('involved');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const appwriteService = new AppwriteService();
  const disputeService = new DisputeService(appwriteService);
  
  useEffect(() => {
    const fetchDisputes = async () => {
      if (!user || !user.profileId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let fetchedDisputes: Dispute[] = [];
        
        if (tab === 'involved') {
          // Fetch disputes where the user is involved as either claimant or defendant
          const claimantDisputes = await disputeService.listDisputesByUser(user.profileId, 'claimant');
          const defendantDisputes = await disputeService.listDisputesByUser(user.profileId, 'defendant');
          
          // Combine and sort by creation date (newest first)
          fetchedDisputes = [...claimantDisputes, ...defendantDisputes]
            .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
        } else {
          // Fetch all open disputes for users with moderator role
          // For non-moderators, this would typically be limited by backend permissions
          fetchedDisputes = await disputeService.listOpenDisputes();
        }
        
        setDisputes(fetchedDisputes);
      } catch (err) {
        console.error('Error fetching disputes:', err);
        setError('Failed to load disputes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDisputes();
  }, [user, tab]);
  
  const handleDisputeCreated = (newDispute: Dispute) => {
    setDisputes(prevDisputes => [newDispute, ...prevDisputes]);
    setShowCreateForm(false);
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          Please log in to view disputes.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contract Disputes</h1>
          
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            File a Dispute
          </button>
        </div>
        
        {showCreateForm ? (
          <div className="mb-8">
            <DisputeForm
              contractId="" // This would normally come from a selected contract
              claimantId={user.profileId || ''}
              defendantId="" // This would normally come from the selected contract
              onSuccess={handleDisputeCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        ) : null}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 ${tab === 'involved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setTab('involved')}
            >
              My Disputes
            </button>
            
            {/* Show the All tab only for users with moderator or admin roles */}
            {user.roles && (user.roles.includes('moderator') || user.roles.includes('admin')) && (
              <button
                className={`px-4 py-3 ${tab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setTab('all')}
              >
                All Open Disputes
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading disputes...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {tab === 'involved' 
                  ? "You don't have any ongoing disputes."
                  : "There are no open disputes at this time."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {disputes.map(dispute => (
                <div key={dispute.$id} className="p-4">
                  <DisputeCard
                    dispute={dispute}
                    isUserClaimant={dispute.claimantId === user.profileId}
                    isUserDefendant={dispute.defendantId === user.profileId}
                    isUserModerator={dispute.assignedModeratorId === user.profileId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputesPage;