export type ImageValidityStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface ImageDeadlineInfo {
  status: ImageValidityStatus;
  remainingMs: number;
  daysRemaining: number;
  hoursRemaining: number;
  label: string;
  shortLabel: string;
  expiryFormatted: string;
  badgeClass: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

const EXPIRING_SOON_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

export function computeExpiryDate(days: number = 7): string {
  const safeDays = Math.max(1, Math.min(90, days));
  return new Date(Date.now() + safeDays * 86400000).toISOString();
}

export function getImageDeadlineInfo(imageExpiryDate?: string): ImageDeadlineInfo {
  const expiryMs = imageExpiryDate ? new Date(imageExpiryDate).getTime() : Date.now() + 7 * 86400000;
  const now = Date.now();
  const remainingMs = expiryMs - now;
  const expiryFormatted = new Date(expiryMs).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (Number.isNaN(expiryMs) || remainingMs <= 0) {
    return {
      status: 'EXPIRED',
      remainingMs: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      label: 'Expired – Fresh Photo Required',
      shortLabel: 'Expired',
      expiryFormatted,
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
      isExpired: true,
      isExpiringSoon: false,
    };
  }

  const hoursRemaining = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
  const daysRemaining = Math.max(1, Math.ceil(remainingMs / 86400000));

  if (remainingMs <= EXPIRING_SOON_THRESHOLD_MS) {
    const timeText = hoursRemaining <= 24 ? `${hoursRemaining}h left` : `${daysRemaining}d left`;
    return {
      status: 'EXPIRING_SOON',
      remainingMs,
      daysRemaining,
      hoursRemaining,
      label: `Expiring Soon (${timeText})`,
      shortLabel: `Expiring · ${timeText}`,
      expiryFormatted,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isExpired: false,
      isExpiringSoon: true,
    };
  }

  return {
    status: 'ACTIVE',
    remainingMs,
    daysRemaining,
    hoursRemaining,
    label: `Photo Valid · ${daysRemaining}d left`,
    shortLabel: `${daysRemaining}d left`,
    expiryFormatted,
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    isExpired: false,
    isExpiringSoon: false,
  };
}
