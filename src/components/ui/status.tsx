import { cn } from '@/libs/utils';

interface StatusProps {
  status: string;
  className?: string;
}

const Status = ({ status, className }: StatusProps) => {
  let statusText: string;
  let statusClass: string;

  switch (status) {
    case 'active':
      statusText = 'Active';
      statusClass = 'bg-success-30 text-success-60';
      break;
    case 'pending':
      statusText = 'Pending';
      statusClass = 'bg-warning-30 text-warning-60';
      break;
    case 'inactive':
      statusText = 'Inactive';
      statusClass = 'bg-error-30 text-error-60';
      break;
    default:
      statusText = 'Unknown';
      statusClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <div className={cn('inline-flex items-center rounded-[5px] px-2 py-1 font-medium text-xs', statusClass, className)}>
      {statusText}
    </div>
  );
};

export default Status;
