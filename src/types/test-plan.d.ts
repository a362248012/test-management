export interface TestPlan {
  id: string;
  name: string;
  description: string;
  content: string;
  implementation: string;
  status: 'DRAFT' | 'COMPLETED' | 'IN_PROGRESS' | 'PLANNING';
  startDate: string;
  endDate: string;
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}
