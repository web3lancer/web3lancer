import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import DisputeService from '@/services/disputeService';
import { AppwriteService } from '@/services/appwriteService';
import NotificationService from '@/services/notificationService';
import { Dispute } from '@/types/governance';
import { envConfig } from '@/config/environment';

interface DisputeFormProps {
  contractId: string;
  claimantId: string;
  defendantId: string;
  onSuccess?: (dispute: Dispute) => void;
  onCancel?: () => void;
}

interface FormValues {
  reason: string;
  preferredOutcome: string;
  evidence: FileList;
}

const DisputeForm: React.FC<DisputeFormProps> = ({
  contractId,
  claimantId,
  defendantId,
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const [error, setError] = useState<string | null>(null);
  
  const appwriteService = new AppwriteService(envConfig);
  const disputeService = new DisputeService(appwriteService);
  const notificationService = new NotificationService(appwriteService);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      
      // Upload evidence files if provided
      let evidenceFileIds: string[] = [];
      if (data.evidence && data.evidence.length > 0) {
        // Implement file upload logic here
        // This would typically use storage service to upload files
        // For now, we'll skip this step
        evidenceFileIds = [];
      }
      
      // Create the dispute
      const disputeData: Omit<Dispute, '$id' | '$createdAt' | '$updatedAt'> = {
        contractId,
        claimantId,
        defendantId,
        reason: data.reason,
        preferredOutcome: data.preferredOutcome,
        evidenceFileIds,
        status: 'open'
      };
      
      const dispute = await disputeService.createDispute(disputeData);
      
      if (!dispute) {
        throw new Error('Failed to create dispute');
      }
      
      // Send notification to the defendant
      await notificationService.createNotification({
        recipientId: defendantId,
        type: 'dispute_update',
        title: 'New Dispute Filed',
        message: `A dispute has been filed for your contract. Please review and respond.`,
        link: `/disputes/${dispute.$id}`,
        entityId: dispute.$id,
        entityType: 'dispute'
      });
      
      if (onSuccess) {
        onSuccess(dispute);
      }
    } catch (err) {
      console.error('Error creating dispute:', err);
      setError('Failed to create dispute. Please try again later.');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">File a Dispute</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
            Reason for Dispute *
          </label>
          <textarea
            id="reason"
            className={`w-full px-3 py-2 border rounded ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
            rows={4}
            placeholder="Describe the issue in detail"
            {...register('reason', { required: 'This field is required' })}
          />
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preferredOutcome">
            Preferred Outcome *
          </label>
          <textarea
            id="preferredOutcome"
            className={`w-full px-3 py-2 border rounded ${errors.preferredOutcome ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            placeholder="What resolution are you seeking?"
            {...register('preferredOutcome', { required: 'This field is required' })}
          />
          {errors.preferredOutcome && (
            <p className="text-red-500 text-xs mt-1">{errors.preferredOutcome.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="evidence">
            Evidence (Optional)
          </label>
          <input
            id="evidence"
            type="file"
            multiple
            className="w-full px-3 py-2 border border-gray-300 rounded"
            {...register('evidence')}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload any files that support your case (screenshots, documents, etc.)
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisputeForm;