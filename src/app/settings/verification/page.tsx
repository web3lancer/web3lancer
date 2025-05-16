"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useProfile from "@/hooks/useProfile";
import { VerificationType } from "@/types";
import { Loader2 } from "lucide-react";

export default function ProfileVerificationPage() {
  const { user } = useAuth();
  const { profile, loading, error, submitVerification, getVerificationRequests } = useProfile();
  
  const [verificationType, setVerificationType] = useState<VerificationType>("kyc");
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setVerificationType(e.target.value as VerificationType);
  };
  
  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      setSubmitError("No profile found to verify");
      return;
    }
    
    if (documents.length === 0) {
      setSubmitError("Please upload at least one document");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const result = await submitVerification(verificationType, documents);
      
      if (result) {
        setSubmitSuccess(true);
        setDocuments([]);
        fetchVerificationRequests();
      } else {
        setSubmitError("Failed to submit verification request");
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      setSubmitError("An error occurred while submitting verification");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fetchVerificationRequests = async () => {
    if (!profile) return;
    
    setLoadingRequests(true);
    try {
      const requests = await getVerificationRequests();
      setVerificationRequests(requests);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };
  
  // Fetch existing verification requests on mount
  useState(() => {
    fetchVerificationRequests();
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  if (!user) {
    return <div className="p-4">Please log in to submit verification</div>;
  }
  
  if (profile?.isVerified) {
    return (
      <div className="p-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Your profile is already verified!</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold">Profile Verification</h2>
      
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Verification request submitted successfully! We'll review your documents and update your profile status.
        </div>
      )}
      
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Submit Verification Request</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Verification Type</label>
            <select
              value={verificationType}
              onChange={handleTypeChange}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            >
              <option value="kyc">KYC (Know Your Customer)</option>
              <option value="company_registration">Company Registration</option>
              <option value="domain_ownership">Domain Ownership</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Upload Documents</label>
            <input
              type="file"
              multiple
              onChange={handleDocumentChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="mt-1 text-xs text-gray-500">
              {verificationType === "kyc" && "Please upload your ID card, passport, or driver's license."}
              {verificationType === "company_registration" && "Please upload your company registration documents."}
              {verificationType === "domain_ownership" && "Please upload proof of domain ownership."}
            </p>
            
            {documents.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Selected documents:</p>
                <ul className="list-disc list-inside text-sm">
                  {documents.map((doc, index) => (
                    <li key={index}>{doc.name} ({Math.round(doc.size / 1024)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || documents.length === 0}
              className="rounded-md bg-primary py-2 px-4 text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      </div>
      
      {/* Existing Verification Requests */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Your Verification Requests</h3>
        
        {loadingRequests ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : verificationRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {verificationRequests.map((request) => (
                  <tr key={request.$id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                      {request.verificationType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                        ${request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                        ${request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                        ${request.status === 'resubmit_required' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' : ''}
                      `}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.$createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You haven't submitted any verification requests yet.
          </p>
        )}
      </div>
    </div>
  );
}