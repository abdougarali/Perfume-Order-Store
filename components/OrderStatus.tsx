'use client';

interface OrderStatusProps {
  status: 'new' | 'confirmed' | 'delivered' | 'canceled';
}

export default function OrderStatus({ status }: OrderStatusProps) {
  const statusConfig = {
    new: {
      label: 'New',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    canceled: {
      label: 'Canceled',
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.className} font-elegant uppercase tracking-wide`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
