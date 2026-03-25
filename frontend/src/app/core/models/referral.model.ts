export interface ReferralCode {
  id: string;
  code: string;
  discountPercent: number;
  maxUses?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralRedemption {
  id: string;
  referredUserName: string;
  discountApplied: number;
  createdAt: string;
}

export interface ReferralDashboard {
  code: ReferralCode;
  redemptions: ReferralRedemption[];
  totalSavingsGenerated: number;
}
