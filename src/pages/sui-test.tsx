import React, { useState } from 'react';
import Head from 'next/head';
import SuiWalletConnector from '@/components/sui/SuiWalletConnector';
import { useSuiIntegration } from '@/hooks/useSui';
import { CONTRACT_CONSTANTS } from '@/utils/contractUtils';

const SuiTestPage: React.FC = () => {
  const { wallet, profile, project, reputation, messaging } = useSuiIntegration();
  const [activeTab, setActiveTab] = useState<'profile' | 'project' | 'reputation' | 'messaging'>('profile');
  const [results, setResults] = useState<any[]>([]);

  // Profile test functions
  const [profileData, setProfileData] = useState({
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio for Sui integration',
    hourlyRate: 50,
  });

  const handleCreateProfile = async () => {
    const result = await profile.createProfile(profileData);
    setResults(prev => [...prev, { action: 'Create Profile', result }]);
  };

  // Project test functions
  const [projectData, setProjectData] = useState({
    title: 'Test Project',
    description: 'Test project for Sui integration',
    budget: 1000,
    milestones: [
      {
        title: 'Milestone 1',
        description: 'First milestone',
        amount: 500,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      },
      {
        title: 'Milestone 2',
        description: 'Second milestone',
        amount: 500,
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
      },
    ],
  });

  const [paymentCoinId, setPaymentCoinId] = useState('');

  const handleCreateProject = async () => {
    if (!paymentCoinId) {
      setResults(prev => [...prev, { action: 'Create Project', result: { success: false, error: 'Payment coin ID required' } }]);
      return;
    }
    const result = await project.createProject(projectData, paymentCoinId);
    setResults(prev => [...prev, { action: 'Create Project', result }]);
  };

  // Reputation test functions
  const [reviewData, setReviewData] = useState({
    projectId: '',
    reviewee: '',
    rating: 5,
    comment: 'Excellent work!',
    skillsRating: 5,
    communicationRating: 5,
    timelinessRating: 5,
    qualityRating: 5,
    isClientReview: true,
  });

  const handleSubmitReview = async () => {
    if (!reviewData.projectId || !reviewData.reviewee) {
      setResults(prev => [...prev, { action: 'Submit Review', result: { success: false, error: 'Project ID and reviewee address required' } }]);
      return;
    }
    const result = await reputation.submitReview(reviewData);
    setResults(prev => [...prev, { action: 'Submit Review', result }]);
  };

  // Messaging test functions
  const [messagingData, setMessagingData] = useState({
    otherParticipant: '',
    projectId: '',
    messageContent: 'Hello from Sui integration test!',
  });

  const handleCreateConversation = async () => {
    if (!messagingData.otherParticipant) {
      setResults(prev => [...prev, { action: 'Create Conversation', result: { success: false, error: 'Other participant address required' } }]);
      return;
    }
    const result = await messaging.createConversation(messagingData.otherParticipant, messagingData.projectId || undefined);
    setResults(prev => [...prev, { action: 'Create Conversation', result }]);
  };

  const clearResults = () => setResults([]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Testing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hourly Rate</label>
                <input
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <button
              onClick={handleCreateProfile}
              disabled={!wallet.isConnected || profile.loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {profile.loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        );

      case 'project':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Testing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Coin ID</label>
                <input
                  type="text"
                  value={paymentCoinId}
                  onChange={(e) => setPaymentCoinId(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Object ID of a SUI coin with sufficient balance for the project budget
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={projectData.title}
                    onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget (MIST)</label>
                  <input
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => setProjectData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateProject}
              disabled={!wallet.isConnected || project.loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              {project.loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        );

      case 'reputation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reputation Testing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project ID</label>
                <input
                  type="text"
                  value={reviewData.projectId}
                  onChange={(e) => setReviewData(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reviewee Address</label>
                <input
                  type="text"
                  value={reviewData.reviewee}
                  onChange={(e) => setReviewData(prev => ({ ...prev, reviewee: e.target.value }))}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overall Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewData.rating}
                  onChange={(e) => setReviewData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewData.skillsRating}
                  onChange={(e) => setReviewData(prev => ({ ...prev, skillsRating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <button
              onClick={handleSubmitReview}
              disabled={!wallet.isConnected || reputation.loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
            >
              {reputation.loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        );

      case 'messaging':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Messaging Testing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Other Participant Address</label>
                <input
                  type="text"
                  value={messagingData.otherParticipant}
                  onChange={(e) => setMessagingData(prev => ({ ...prev, otherParticipant: e.target.value }))}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project ID (optional)</label>
                <input
                  type="text"
                  value={messagingData.projectId}
                  onChange={(e) => setMessagingData(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message Content</label>
                <textarea
                  value={messagingData.messageContent}
                  onChange={(e) => setMessagingData(prev => ({ ...prev, messageContent: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>
            <button
              onClick={handleCreateConversation}
              disabled={!wallet.isConnected || messaging.loading}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300"
            >
              {messaging.loading ? 'Creating...' : 'Create Conversation'}
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Sui Integration Test - Web3Lancer</title>
        <meta name="description" content="Test page for Sui smart contract integration" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sui Integration Test</h1>
            
            {/* Wallet Connection */}
            <div className="mb-8">
              <SuiWalletConnector />
            </div>

            {/* Contract Constants Display */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Contract Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Package ID:</span>
                  <p className="font-mono text-blue-700 break-all">0x1338a3eb832f3d71f34f9f0ac2637367228219a591e68ee46add2192e547c881</p>
                </div>
                <div>
                  <span className="font-medium">Network:</span>
                  <p className="text-blue-700">Sui Testnet</p>
                </div>
              </div>
            </div>

            {wallet.isConnected && (
              <>
                {/* Tab Navigation */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {(['profile', 'project', 'reputation', 'messaging'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                            activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="mb-8">
                  {renderTabContent()}
                </div>

                {/* Results Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Transaction Results</h3>
                    <button
                      onClick={clearResults}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.length === 0 ? (
                      <p className="text-gray-500 italic">No transactions yet...</p>
                    ) : (
                      results.map((item, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            item.result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{item.action}</span>
                            <span className={`text-sm ${item.result.success ? 'text-green-600' : 'text-red-600'}`}>
                              {item.result.success ? '✅ Success' : '❌ Failed'}
                            </span>
                          </div>
                          <pre className="mt-2 text-xs overflow-x-auto bg-gray-100 p-2 rounded">
                            {JSON.stringify(item.result, null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuiTestPage;