'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contractService } from '@/services/contract.service';
import { Contract } from '@/types';
import { ContractCard } from '@/components/contracts/ContractCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<{
    client: Contract[];
    freelancer: Contract[];
  }>({
    client: [],
    freelancer: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user?.userId) return;
      
      setLoading(true);
      try {
        const [clientContracts, freelancerContracts] = await Promise.all([
          contractService.getUserContracts(user.userId, 'client'),
          contractService.getUserContracts(user.userId, 'freelancer')
        ]);
        
        setContracts({
          client: clientContracts,
          freelancer: freelancerContracts
        });
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user?.userId]);

  // Filter contracts based on the active tab
  const filteredContracts = () => {
    const allContracts = [...contracts.client, ...contracts.freelancer];
    
    if (activeTab === 'all') {
      return allContracts;
    } else if (activeTab === 'client') {
      return contracts.client;
    } else if (activeTab === 'freelancer') {
      return contracts.freelancer;
    } else if (activeTab === 'active') {
      return allContracts.filter(c => c.status === 'active');
    } else if (activeTab === 'completed') {
      return allContracts.filter(c => c.status === 'completed');
    } else {
      return allContracts;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Contracts</h1>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="client">As Client</TabsTrigger>
          <TabsTrigger value="freelancer">As Freelancer</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredContracts().length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No contracts found for this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts().map((contract) => (
                <ContractCard key={contract.$id} contract={contract} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}