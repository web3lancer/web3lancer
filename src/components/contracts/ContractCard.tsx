import { Contract } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ContractCardProps {
  contract: Contract;
}

const ContractStatusBadge = ({ status }: { status: Contract['status'] }) => {
  const statusStyles = {
    draft: 'bg-gray-200 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    disputed: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Badge className={statusStyles[status] || ''}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const ContractCard = ({ contract }: ContractCardProps) => {
  // Calculate progress based on milestones
  const calculateProgress = () => {
    if (!contract.milestones || contract.milestones.length === 0) {
      return contract.status === 'completed' ? 100 : 0;
    }
    
    const completedMilestones = contract.milestones.filter(
      m => m.status === 'approved' || m.status === 'paid'
    ).length;
    
    return Math.round((completedMilestones / contract.milestones.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{contract.title}</CardTitle>
            <CardDescription>
              {contract.startDate && `Started: ${formatDate(contract.startDate)}`}
            </CardDescription>
          </div>
          <ContractStatusBadge status={contract.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
          <p className="font-medium">${contract.budget.toFixed(2)}</p>
        </div>
        
        {contract.duration && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            <p className="font-medium">
              {contract.duration.value} {contract.duration.unit}
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">{progress}%</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link 
          href={`/contracts/${contract.$id}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};