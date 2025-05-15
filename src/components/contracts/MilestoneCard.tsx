import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor, formatContractStatus } from "@/lib/utils";
import { Milestone } from "@/types";

interface MilestoneCardProps {
  milestone: Milestone;
  userRole: 'client' | 'freelancer';
  onStatusUpdate?: (milestoneId: string, status: Milestone['status']) => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  milestone,
  userRole,
  onStatusUpdate
}) => {
  const handleUpdateStatus = (status: Milestone['status']) => {
    if (onStatusUpdate) {
      onStatusUpdate(milestone.$id, status);
    }
  };

  const renderStatusActions = () => {
    // Different actions based on user role and current milestone status
    if (userRole === 'client') {
      switch (milestone.status) {
        case 'pending':
          return (
            <>
              <Button size="sm" onClick={() => handleUpdateStatus('in_progress')}>
                Start Milestone
              </Button>
            </>
          );
        case 'submitted_for_approval':
          return (
            <>
              <Button size="sm" onClick={() => handleUpdateStatus('approved')}>
                Approve
              </Button>
              <Button 
                size="sm"
                variant="destructive" 
                onClick={() => handleUpdateStatus('rejected')}
              >
                Reject
              </Button>
            </>
          );
        case 'approved':
          return (
            <>
              <Button size="sm" onClick={() => handleUpdateStatus('paid')}>
                Mark as Paid
              </Button>
            </>
          );
        default:
          return null;
      }
    } else if (userRole === 'freelancer') {
      switch (milestone.status) {
        case 'in_progress':
          return (
            <>
              <Button 
                size="sm"
                onClick={() => handleUpdateStatus('submitted_for_approval')}
              >
                Submit for Approval
              </Button>
            </>
          );
        default:
          return null;
      }
    }
    
    return null;
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{milestone.title}</CardTitle>
          <Badge 
            variant={getStatusColor(milestone.status) as any}
          >
            {formatContractStatus(milestone.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 mt-1">
              {milestone.description || 'No description provided'}
            </p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-medium">Amount</h3>
              <p className="text-sm text-gray-500 mt-1">
                ${milestone.amount.toFixed(2)}
              </p>
            </div>
            
            {milestone.dueDate && (
              <div>
                <h3 className="text-sm font-medium">Due Date</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(milestone.dueDate)}
                </p>
              </div>
            )}
            
            {milestone.completedAt && (
              <div>
                <h3 className="text-sm font-medium">Completed</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(milestone.completedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex space-x-2 ml-auto">
          {renderStatusActions()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MilestoneCard;