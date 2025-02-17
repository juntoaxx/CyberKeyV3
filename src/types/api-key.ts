import { Timestamp } from 'firebase/firestore';

export type ApiKey = {
  id?: string;
  name: string;
  key: string;
  providerName: string;
  fundingLink: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  usageLimit?: number | null;
  allowedDomains?: string[];
  isEnabled: boolean;
  expiresAt?: Timestamp;
  balance?: number;
};
