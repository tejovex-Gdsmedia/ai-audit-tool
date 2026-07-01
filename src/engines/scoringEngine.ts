import type { AuditInputs } from '../types';

export interface ScoringResult {
  priority: 'High' | 'Medium' | 'Low';
  priorityExplanation: string;
}

export function calculatePriority(inputs: AuditInputs): ScoringResult {
  const totalWeeklyHours = inputs.hoursSpentPerWeek * inputs.numberOfEmployees;
  
  let priority: 'High' | 'Medium' | 'Low' = 'Low';
  let priorityExplanation = '';

  if (totalWeeklyHours >= 40) {
    priority = 'High';
    priorityExplanation = `Immediate action recommended. The high frequency of tasks combined with ${inputs.numberOfEmployees} employees spending ${inputs.hoursSpentPerWeek} hours/week indicates that manual operations are severely limiting business scalability.`;
  } else if (totalWeeklyHours >= 15) {
    priority = 'Medium';
    priorityExplanation = `Moderate priority. Freeing up ${totalWeeklyHours} hours per week across your team will create visible productivity gains and reduce administrative fatigue.`;
  } else {
    priority = 'Low';
    priorityExplanation = `Lower priority. While automation will improve accuracy and consistency, the low total hours spent indicates this can be scheduled after higher-impact tasks.`;
  }

  return {
    priority,
    priorityExplanation
  };
}
