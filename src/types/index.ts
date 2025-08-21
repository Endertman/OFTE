export interface Inscription {
  id: string;
  name: string;
  email: string;
  degree: string;
  institution: string;
  workshopId: string;
  workshopName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
} 