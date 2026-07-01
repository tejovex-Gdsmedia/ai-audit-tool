import type { AuditInputs, AuditReport, NextStep } from '../types';
import { calculatePriority } from './scoringEngine';
import { calculateROI } from './roiCalculator';
import { assessChallenges } from './confidenceEngine';
import { recommendStrategy } from './recommendationEngine';
import { generateWorkflow } from './workflowGenerator';

export function runAuditAnalysis(inputs: AuditInputs): AuditReport {
  const reportId = 'AUD-' + Math.floor(100000 + Math.random() * 900000);
  const timestamp = Date.now();

  const priorityResult = calculatePriority(inputs);
  const roi = calculateROI(inputs);
  const challengesResult = assessChallenges(inputs);
  const recommendedStrategy = recommendStrategy(inputs);
  const workflowResult = generateWorkflow(inputs);

  // Why improve bullets
  const whyImprove: string[] = ['Repetitive work', 'Standard process'];
  if (inputs.taskFrequency === 'Daily' || inputs.taskFrequency === 'Weekly') {
    whyImprove.push('Frequent task');
  }
  if (inputs.hoursSpentPerWeek >= 10) {
    whyImprove.push('Time consuming');
  }
  if (inputs.involves.includes('Excel') || inputs.involves.includes('CRM') || inputs.involves.includes('Customer Data')) {
    whyImprove.push('Manual data handling');
  }

  // Business Benefits
  const businessBenefits: string[] = ['Less manual work', 'Higher productivity'];
  if (inputs.taskFrequency === 'Daily') {
    businessBenefits.push('Faster processing and response times');
  } else {
    businessBenefits.push('Consistent and predictable execution');
  }

  if (inputs.numberOfEmployees > 2) {
    businessBenefits.push('Higher team capacity and scalability');
  }

  if (inputs.involves.includes('Customer Data') || inputs.involves.includes('Chat Support')) {
    businessBenefits.push('Better customer experience and fewer communication gaps');
  } else {
    businessBenefits.push('Improved accuracy and fewer transcript errors');
  }

  // Executive Summary
  const time = roi.yearlyHoursSaved;
  const moneyText = roi.yearlyCostSavings !== undefined 
    ? ` and reclaim ₹${roi.yearlyCostSavings.toLocaleString('en-IN')} in labor value` 
    : '';

  const executiveSummary = `We have reviewed the manual "${inputs.employeeRole}" workflow within the ${inputs.department} department at ${inputs.companyName}. Currently, this manual process takes up ${inputs.hoursSpentPerWeek} hours per week per employee, involving ${inputs.numberOfEmployees} employee(s). By implementing the recommended automated strategy, the team can save approximately ${time} hours annually${moneyText}, yielding a ${roi.productivityImprovementPct || 70}% boost in time efficiency. This transition directly targets your key operational challenge: "${inputs.biggestPainPoint}".`;

  // 3-step Roadmap
  const threeStepRoadmap: NextStep[] = [
    {
      step: 1,
      title: 'Understand the current process',
      description: 'Document every single detail, input file, and decision point in the current manual workflow so that the automation logic is accurate.'
    },
    {
      step: 2,
      title: 'Build and test a small pilot',
      description: `Create a small-scale, simplified test version of the automation to verify workflow reliability and catch errors before full deployment.`
    },
    {
      step: 3,
      title: 'Roll out the automation',
      description: `Deploy the automation system fully, train ${inputs.employeeRole} team members on how to monitor it, and track daily operational time saved.`
    }
  ];

  const disclaimer = "This report provides advisory recommendations based on the information entered by the user. Actual results may vary depending on the organization's processes and implementation.";

  return {
    reportId,
    timestamp,
    inputs,
    executiveSummary,
    automationOpportunity: challengesResult.automationOpportunity,
    automationOpportunityExplanation: challengesResult.automationOpportunityExplanation,
    whyImprove,
    currentManualWorkflow: workflowResult.currentManualWorkflow,
    suggestedAutomatedWorkflow: workflowResult.suggestedAutomatedWorkflow,
    estimatedTimeSaved: roi,
    recommendedStrategy,
    businessBenefits,
    possibleChallenges: challengesResult.possibleChallenges,
    priority: priorityResult.priority,
    priorityExplanation: priorityResult.priorityExplanation,
    threeStepRoadmap,
    disclaimer
  };
}
