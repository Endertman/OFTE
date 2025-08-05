export interface Workshop {
  id: string;
  name: string;
  date: string;
  location: string;
  image: string;
  description: string;
  short_description: string; 
  features: string[];
}

export interface Inscription {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  workshopId: string;
  workshopName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
} 