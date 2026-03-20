export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
}

export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  FULL = 'FULL',
  INSTALLMENT = 'INSTALLMENT',
  REFUND = 'REFUND',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export interface SessionPackage {
  id: string;
  name: string;
  description?: string;
  sessionCount: number;
  price: number;
  perSessionPrice?: number;
  validDays?: number;
  isActive: boolean;
}

export interface ClientPackage {
  id: string;
  packageId: string;
  sessionsRemaining: number;
  purchasedAt: string;
  expiresAt?: string;
  status: string;
  packageName?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}
