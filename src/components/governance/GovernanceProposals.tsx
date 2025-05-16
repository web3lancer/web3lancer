import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GovernanceService from '@/services/governanceService';
import { GovernanceProposal, GovernanceVote } from '@/types/governance';

interface GovernanceProposalCardProps {
  proposal: GovernanceProposal;
  userVote?: GovernanceVote | null;
  onVote: (proposalId: string, vote: 'for' | 'against' | 'abstain', comment?: string) => Promise<void>;
  isVoting: boolean;
}

// Individual proposal card component
const GovernanceProposalCard: React.FC<GovernanceProposalCardProps> = ({ 
  proposal,
  userVote,
  onVote,
  isVoting
}) => {
  const [comment, setComment] = useState<string>('');
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(
    userVote ? userVote.vote : null
  );

  const isActive = proposal.status === 'voting';
  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  
  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Active</span>;
      case 'voting':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Voting</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'implemented':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Implemented</span>;
      default:
        return null;
    }
  };

  const getCategoryBadge = () => {
    switch (proposal.category) {
      case 'platform_policy':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Platform Policy</span>;
      case 'fee_structure':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Fee Structure</span>;
      case 'feature_request':
        return <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800">Feature Request</span>;
      case 'other':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Other</span>;
      default:
        return null;
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedVote) return;
    await onVote(proposal.$id, selectedVote, comment);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{proposal.title}</h3>
          {getStatusBadge()}
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {getCategoryBadge()}
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Created: {new Date(proposal.$createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <p className="mb-4 text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Voting Results</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-24 text-sm text-gray-600">For:</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: totalVotes ? `${(proposal.votesFor / totalVotes) * 100}%` : '0%' }}
                ></div>
              </div>
              <div className="ml-2 text-sm text-gray-600">{proposal.votesFor} ({totalVotes ? Math.round((proposal.votesFor / totalVotes) * 100) : 0}%)</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm text-gray-600">Against:</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: totalVotes ? `${(proposal.votesAgainst / totalVotes) * 100}%` : '0%' }}
                ></div>
              </div>
              <div className="ml-2 text-sm text-gray-600">{proposal.votesAgainst} ({totalVotes ? Math.round((proposal.votesAgainst / totalVotes) * 100) : 0}%)</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm text-gray-600">Abstain:</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gray-400 h-2.5 rounded-full" 
                  style={{ width: totalVotes ? `${(proposal.votesAbstain / totalVotes) * 100}%` : '0%' }}
                ></div>
              </div>
              <div className="ml-2 text-sm text-gray-600">{proposal.votesAbstain} ({totalVotes ? Math.round((proposal.votesAbstain / totalVotes) * 100) : 0}%)</div>
            </div>
          </div>
        </div>
        
        {isActive && !userVote && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cast Your Vote</h4>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                className={`px-3 py-1 text-sm font-medium rounded border ${
                  selectedVote === 'for' 
                    ? 'bg-green-100 border-green-600 text-green-800' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
                }`}
                onClick={() => setSelectedVote('for')}
                disabled={isVoting}
              >
                Vote For
              </button>
              <button
                className={`px-3 py-1 text-sm font-medium rounded border ${
                  selectedVote === 'against' 
                    ? 'bg-red-100 border-red-600 text-red-800' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50'
                }`}
                onClick={() => setSelectedVote('against')}
                disabled={isVoting}
              >
                Vote Against
              </button>
              <button
                className={`px-3 py-1 text-sm font-medium rounded border ${
                  selectedVote === 'abstain' 
                    ? 'bg-gray-100 border-gray-600 text-gray-800' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedVote('abstain')}
                disabled={isVoting}
              >
                Abstain
              </button>
            </div>
            
            <div className="mb-3">
              <label htmlFor={`comment-${proposal.$id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <textarea
                id={`comment-${proposal.$id}`}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Add a comment with your vote"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isVoting}
              />
            </div>
            
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              onClick={handleSubmitVote}
              disabled={!selectedVote || isVoting}
            >
              {isVoting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        )}
        
        {userVote && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center">
              <div className="mr-2 text-sm font-medium text-gray-700">Your vote:</div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                userVote.vote === 'for' ? 'bg-green-100 text-green-800' : 
                userVote.vote === 'against' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {userVote.vote === 'for' ? 'For' : 
                 userVote.vote === 'against' ? 'Against' : 
                 'Abstain'}
              </span>
            </div>
            
            {userVote.comment && (
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-700">Your comment:</div>
                <p className="mt-1 text-sm text-gray-600">{userVote.comment}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface GovernanceProposalsProps {
  governanceService: GovernanceService;
}

// Main governance proposals component
const GovernanceProposals: React.FC<GovernanceProposalsProps> = ({ governanceService }) => {
  const { user } = useAuthContext();
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, GovernanceVote>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch all proposals
        const allProposals = await governanceService.listProposals([]);
        setProposals(allProposals);
        
        // Fetch user votes if logged in
        const votesPromises = allProposals.map(proposal => 
          governanceService.getUserVoteOnProposal(proposal.$id, user.id)
        );
        
        const votesResults = await Promise.all(votesPromises);
        
        // Create a record of user votes by proposal ID
        const votesMap: Record<string, GovernanceVote> = {};
        votesResults.forEach((vote, index) => {
          if (vote) {
            votesMap[allProposals[index].$id] = vote;
          }
        });
        
        setUserVotes(votesMap);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [user, governanceService]);

  const handleVote = async (proposalId: string, vote: 'for' | 'against' | 'abstain', comment?: string) => {
    if (!user) return;
    
    setIsVoting(true);
    try {
      // Cast the vote
      const voteData = await governanceService.castVote({
        proposalId,
        voterId: user.id,
        vote,
        comment
      });
      
      // Update the user votes map
      setUserVotes(prev => ({
        ...prev,
        [proposalId]: voteData
      }));
      
      // Update the proposal vote counts
      setProposals(prev => 
        prev.map(proposal => {
          if (proposal.$id === proposalId) {
            const updatedProposal = { ...proposal };
            
            if (vote === 'for') updatedProposal.votesFor += 1;
            else if (vote === 'against') updatedProposal.votesAgainst += 1;
            else if (vote === 'abstain') updatedProposal.votesAbstain += 1;
            
            return updatedProposal;
          }
          return proposal;
        })
      );
      
      alert('Vote submitted successfully!');
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const filteredProposals = activeTab === 'active'
    ? proposals.filter(p => ['active', 'voting'].includes(p.status))
    : proposals.filter(p => ['approved', 'rejected', 'implemented'].includes(p.status));

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Please log in to view governance proposals</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Governance Proposals</h1>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Proposals
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Proposals
            </button>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="space-y-6">
          {filteredProposals.map(proposal => (
            <GovernanceProposalCard
              key={proposal.$id}
              proposal={proposal}
              userVote={userVotes[proposal.$id] || null}
              onVote={handleVote}
              isVoting={isVoting}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No {activeTab} proposals found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {activeTab === 'active' 
              ? 'There are no active proposals currently open for voting.' 
              : 'There are no completed proposals available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GovernanceProposals;