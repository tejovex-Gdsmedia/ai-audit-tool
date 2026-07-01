export interface AuditInputs {
  companyName: string;
  industry: string;
  department: string;
  employeeRole: string;
  taskDescription: string;
  hoursSpentPerWeek: number;
  numberOfEmployees: number;
  taskFrequency: 'Daily' | 'Weekly' | 'Monthly';
  involves: string[]; // 'Emails' | 'Excel' | 'PDFs' | 'CRM' | 'Customer Data' | 'Documents' | 'Images' | 'Chat Support'
  currentSoftware: string;
  biggestPainPoint: string;
  hourlyLaborCost?: number;
}

export interface ROIProjection {
  weeklyHoursSaved: number;
  monthlyHoursSaved: number;
  yearlyHoursSaved: number;
  productivityImprovementPct: number;
  weeklyCostSavings?: number;
  monthlyCostSavings?: number;
  yearlyCostSavings?: number;
}

export interface NextStep {
  step: number;
  title: string;
  description: string;
}

export interface AuditReport {
  reportId: string;
  timestamp: number;
  inputs: AuditInputs;
  executiveSummary: string;
  automationOpportunity: 'High' | 'Medium' | 'Low';
  automationOpportunityExplanation: string;
  whyImprove: string[]; // simple bullet points e.g. ["Repetitive work", "Time consuming", ...]
  currentManualWorkflow: string[];
  suggestedAutomatedWorkflow: string[];
  estimatedTimeSaved: ROIProjection;
  recommendedStrategy: string[]; // Strategy bullet points
  businessBenefits: string[];
  possibleChallenges: string[];
  priority: 'High' | 'Medium' | 'Low';
  priorityExplanation: string;
  threeStepRoadmap: NextStep[];
  disclaimer: string;
}

export interface UserAccount {
  name: string;
  email: string;
}

export interface HistoricalAudit {
  reportId: string;
  companyName: string;
  department: string;
  taskDescription: string;
  timestamp: number;
  userId: string; // associate report with a specific user uuid
  report: AuditReport;
  dbId?: string; // supabase database primary key
}
