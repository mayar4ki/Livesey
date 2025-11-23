import { getOurTokenDecimals } from '~/utils/token-decimals';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  return formatDate(d);
}

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

export function getOrderInfo(order: LimitOrder) {
  if (!order.token) return { isOurToken: false, orderType: null, symbol: null, isMake: false };
  const isOurTokenMake = order.token.token.toLowerCase() === order.makeToken.toLowerCase();
  const isOurTokenTake = order.token.token.toLowerCase() === order.takeToken.toLowerCase();
  return {
    isOurToken: isOurTokenMake || isOurTokenTake,
    orderType: isOurTokenMake ? 'SELL' : 'BUY',
    symbol: order.token.symbol,
    isMake: isOurTokenMake,
  };
}

export function getTokenDecimals(
  address: string,
  order: LimitOrder,
  tokenMap: Map<string, { name: string; symbol: string; decimals: number }>
): number {
  if (order.token && order.token.token.toLowerCase() === address.toLowerCase()) {
    return getOurTokenDecimals();
  }
  return tokenMap.get(address.toLowerCase())?.decimals || 18;
}

export function getTokenSymbol(
  address: string,
  isMake: boolean,
  order: LimitOrder,
  tokenMap: Map<string, { name: string; symbol: string; decimals: number }>
): string {
  const tokenInfo = tokenMap.get(address.toLowerCase());
  if (tokenInfo?.symbol) return tokenInfo.symbol;

  // Check if it's our token
  const info = getOrderInfo(order);
  if (info.isOurToken && isMake === info.isMake && info.symbol) return info.symbol;

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

