import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Contract } from "@/types";
import Link from 'next/link';

interface ContractDetailsProps {
  contract: Contract;
  userRole: 'client' | 'freelancer';
  onStatusUpdate?: (contractId: string, status: Contract['status']) => void;
}

const statusColors = {
  draft: "bg-gray-500",
  active: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
  disputed: "bg-yellow-500",
};

const ContractDetails: React.FC<ContractDetailsProps> = ({ 
  contract, 
  userRole,
  onStatusUpdate 
}) => {
  const handleUpdateStatus = (status: Contract['status']) => {
    if (onStatusUpdate) {
      onStatusUpdate(contract.$id, status);
    }
  };

  const renderStatusActions = () => {
    // Different actions based on user role and current contract status
    if (userRole === 'client') {
      switch (contract.status) {
        case 'draft':
          return (
            <>
              <Button onClick={() => handleUpdateStatus('active')}>
                Activate Contract
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleUpdateStatus('cancelled')}
              >
                Cancel
              </Button>
            </>
          );
        case 'active':
          return (
            <>
              <Button onClick={() => handleUpdateStatus('completed')}>
                Mark Completed
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleUpdateStatus('cancelled')}
              >
                Cancel Contract
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleUpdateStatus('disputed')}
              >
                Raise Dispute
              </Button>
            </>
          );
        default:
          return null;
      }
    } else if (userRole === 'freelancer') {
      switch (contract.status) {
        case 'active':
          return (
            <>
              <Button 
                variant="outline" 
                onClick={() => handleUpdateStatus('disputed')}
              >
                Raise Dispute
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{contract.title}</CardTitle>
            <CardDescription>
              Contract ID: {contract.$id}
            </CardDescription>
          </div>
          <Badge 
            className={`${statusColors[contract.status] || "bg-gray-500"} text-white`}
          >
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-gray-500 mt-1">
              {contract.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Budget</h3>
              <p className="text-sm text-gray-500 mt-1">
                ${contract.budget.toFixed(2)}
              </p>
            </div>
            
            {contract.duration && (
              <div>
                <h3 className="text-sm font-medium">Duration</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {contract.duration.value} {contract.duration.unit}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium">Start Date</h3>
              <p className="text-sm text-gray-500 mt-1">
                {contract.startDate ? formatDate(contract.startDate) : 'Not started'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">End Date</h3>
              <p className="text-sm text-gray-500 mt-1">
                {contract.endDate ? formatDate(contract.endDate) : 'Not completed'}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Terms & Conditions</h3>
            <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">
              {contract.terms}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Link href={`/contracts/${contract.$id}/milestones`}>
            <Button variant="outline">View Milestones</Button>
          </Link>
        </div>
        
        <div className="flex space-x-2">
          {renderStatusActions()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContractDetails;