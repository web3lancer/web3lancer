import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import contractService from '@/services/contractService';
import { Contract } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContracts() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch contracts as both client and freelancer
        const clientContracts = await contractService.getContractsByClientId(user.userId);
        const freelancerContracts = await contractService.getContractsByFreelancerId(user.userId);
        
        // Combine and deduplicate contracts
        const allContracts = [...clientContracts, ...freelancerContracts];
        const uniqueContracts = allContracts.filter((contract, index, self) =>
          index === self.findIndex((c) => c.$id === contract.$id)
        );
        
        setContracts(uniqueContracts);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Failed to fetch contracts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContracts();
  }, [user]);

  const renderContractStatus = (status: Contract['status']) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      disputed: "bg-yellow-100 text-yellow-800",
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || "bg-gray-100"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Contracts</h1>
        <div className="text-center py-10">Loading contracts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Contracts</h1>
        <div className="text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Contracts</h1>
      </div>
      
      {contracts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You don't have any contracts yet.</p>
          <Link href="/jobs" className="text-blue-600 hover:underline">
            Browse available jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    With
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => {
                  const isClient = contract.clientId === user?.userId;
                  const otherParty = isClient ? 'Freelancer' : 'Client';
                  const otherPartyId = isClient ? contract.freelancerId : contract.clientId;
                  
                  return (
                    <tr key={contract.$id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contract.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Project ID: {contract.projectId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {otherParty}: {otherPartyId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${contract.budget.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderContractStatus(contract.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.startDate ? formatDate(contract.startDate) : 'Not started'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/contracts/${contract.$id}`} 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/contracts/${contract.$id}/milestones`} 
                          className="text-green-600 hover:text-green-900"
                        >
                          Milestones
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}