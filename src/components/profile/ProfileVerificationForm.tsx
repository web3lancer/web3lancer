import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import profileService from '@/services/profileService';
import { Profile, VerificationType } from '@/types';

const verificationTypes: { type: VerificationType; label: string; description: string }[] = [
  {
    type: 'basic',
    label: 'Basic Verification',
    description: 'Verify email and phone number to establish a basic level of trust.'
  },
  {
    type: 'identity',
    label: 'Identity Verification',
    description: 'Verify your identity with government-issued ID to gain higher trust level.'
  },
  {
    type: 'professional',
    label: 'Professional Verification',
    description: 'Verify your professional credentials, certifications, or portfolio.'
  },
  {
    type: 'organization',
    label: 'Organization Verification',
    description: 'Verify your organization with business documentation and proof of legal status.'
  }
];

const ProfileVerificationForm: React.FC = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedType, setSelectedType] = useState<VerificationType>('basic');
  const [documents, setDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);

  // Fetch user profile and existing verification requests on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.userId) return;
      
      try {
        const userProfile = await profileService.getProfileByUserId(user.userId);
        if (userProfile) {
          setProfile(userProfile);
          
          // Fetch verification requests
          const requests = await profileService.getVerificationRequests(userProfile.$id);
          setVerificationRequests(requests);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleVerificationTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value as VerificationType);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setDocuments(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user || documents.length === 0) {
      setMessage({ type: 'error', text: 'Please upload required documents.' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await profileService.submitVerification(
        profile.$id,
        user.userId,
        selectedType,
        documents
      );
      
      if (result.request) {
        setMessage({ 
          type: 'success', 
          text: 'Verification request submitted successfully! We will review your documents and get back to you.' 
        });
        
        // Reset form
        setDocuments([]);
        
        // Fetch updated verification requests
        const requests = await profileService.getVerificationRequests(profile.$id);
        setVerificationRequests(requests);
      } else {
        throw new Error('Failed to submit verification request');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      setMessage({ type: 'error', text: 'Failed to submit verification request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to request verification.</div>;
  }

  // Check if user is already verified
  const isAlreadyVerified = profile?.isVerified;
  
  // Check for pending verification requests
  const hasPendingRequests = verificationRequests.some(req => req.status === 'pending');

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Verification</h2>
      
      {isAlreadyVerified && (
        <div className="p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Your profile is already verified! Enjoy the benefits of a verified account.</span>
        </div>
      )}
      
      {hasPendingRequests && !isAlreadyVerified && (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
          You have pending verification request(s). We'll review them shortly.
        </div>
      )}
      
      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {!isAlreadyVerified && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Select Verification Type</h3>
            <div className="space-y-4">
              {verificationTypes.map((vType) => (
                <div key={vType.type} className="flex items-start">
                  <input
                    type="radio"
                    id={vType.type}
                    name="verificationType"
                    value={vType.type}
                    checked={selectedType === vType.type}
                    onChange={handleVerificationTypeChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={vType.type} className="ml-3">
                    <div className="text-md font-medium text-gray-700 dark:text-gray-300">{vType.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{vType.description}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Upload Documents</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
              <input
                type="file"
                id="documents"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="documents"
                className="cursor-pointer block"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mx-auto h-12 w-12 text-gray-400"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
              </label>
            </div>
            
            {documents.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files:</h4>
                <ul className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {documents.map((file, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2 text-gray-400"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Verification Instructions</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p>Please provide clear, high-quality images of the required documents based on your selected verification type:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {selectedType === 'basic' && (
                  <>
                    <li>Photo of your phone showing your phone number</li>
                    <li>Screenshot of email verification</li>
                  </>
                )}
                {selectedType === 'identity' && (
                  <>
                    <li>Front and back of government-issued ID</li>
                    <li>Selfie with your ID visible</li>
                  </>
                )}
                {selectedType === 'professional' && (
                  <>
                    <li>Professional certifications</li>
                    <li>Portfolio or work samples</li>
                    <li>Proof of education/training</li>
                  </>
                )}
                {selectedType === 'organization' && (
                  <>
                    <li>Business registration documents</li>
                    <li>Tax identification documents</li>
                    <li>Proof of business address</li>
                  </>
                )}
              </ul>
              <p>Verification usually takes 1-3 business days. You'll be notified once your request is reviewed.</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || documents.length === 0 || hasPendingRequests}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                (isLoading || documents.length === 0 || hasPendingRequests) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}
      
      {/* Previous verification requests */}
      {verificationRequests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Verification History</h3>
          <div className="border rounded-md divide-y">
            {verificationRequests.map((request, idx) => (
              <div key={idx} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {verificationTypes.find(vType => vType.type === request.verificationType)?.label || request.verificationType}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                
                {request.notes && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <strong>Notes:</strong> {request.notes}
                  </div>
                )}
                
                {request.documentIds && request.documentIds.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{request.documentIds.length} document(s) submitted</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileVerificationForm;