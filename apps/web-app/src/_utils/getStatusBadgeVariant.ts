import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';

export function getStatusBadgeVariant(status: LimitOrder['status']) {
  switch (status) {
    case 'pending':
      return 'default';
    case 'filled':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'expired':
      return 'outline';
    default:
      return 'secondary';
  }
}
