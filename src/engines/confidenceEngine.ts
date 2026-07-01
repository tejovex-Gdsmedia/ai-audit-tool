import type { AuditInputs } from '../types';

export interface ChallengesResult {
  possibleChallenges: string[];
  automationOpportunity: 'High' | 'Medium' | 'Low';
  automationOpportunityExplanation: string;
}

export function assessChallenges(inputs: AuditInputs): ChallengesResult {
  const challenges: string[] = [];
  const involves = inputs.involves;

  // Challenges based on task complexity
  if (involves.includes('Chat Support') || involves.includes('Customer Data')) {
    challenges.push('Initial team training will be required to handle live conversation handoffs.');
  }
  
  if (involves.includes('PDFs') || involves.includes('Images')) {
    challenges.push('Document formats (like invoice layouts or scanned sheets) need standard templates for highest accuracy.');
  }

  if (involves.includes('CRM') || (inputs.currentSoftware && inputs.currentSoftware.trim().length > 0)) {
    challenges.push('Login credentials and software access permissions need to be securely set up for the automated process.');
  }

  // General business challenges
  challenges.push('Team workflows must adjust to reviewing exceptions rather than performing manual entry.');
  challenges.push('A human review step is recommended for high-priority or unique cases to maintain quality.');

  // Opportunity logic
  let opportunity: 'High' | 'Medium' | 'Low' = 'High';
  let explanation = '';

  const totalHours = inputs.hoursSpentPerWeek * inputs.numberOfEmployees;
  if (totalHours >= 30) {
    opportunity = 'High';
    explanation = `Automating this process will release a massive operational bottleneck, saving your team over ${totalHours} combined hours each week.`;
  } else if (totalHours >= 10) {
    opportunity = 'Medium';
    explanation = `Your team spends a noticeable amount of time (${totalHours} hours/week) on this task. Automation will free up significant staff bandwidth for higher-value activities.`;
  } else {
    opportunity = 'Low';
    explanation = `Currently consuming ${totalHours} hours/week, this manual task has a lower immediate time-saving impact, though automation will still eliminate repetitive friction.`;
  }

  return {
    possibleChallenges: challenges,
    automationOpportunity: opportunity,
    automationOpportunityExplanation: explanation
  };
}
