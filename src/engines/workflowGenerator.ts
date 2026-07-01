import type { AuditInputs } from '../types';

export interface WorkflowResult {
  currentManualWorkflow: string[];
  suggestedAutomatedWorkflow: string[];
}

export function generateWorkflow(inputs: AuditInputs): WorkflowResult {
  const currentManualWorkflow: string[] = [];
  const suggestedAutomatedWorkflow: string[] = [];
  const involves = inputs.involves;

  // 1. Current Process Steps
  if (involves.includes('Emails')) {
    currentManualWorkflow.push('Receive request or details via email inbox');
  } else if (involves.includes('Chat Support')) {
    currentManualWorkflow.push('Receive query from customer via messaging app');
  } else if (involves.includes('PDFs') || involves.includes('Excel') || involves.includes('Documents')) {
    currentManualWorkflow.push('Locate and download document files from local system or shared folder');
  } else {
    currentManualWorkflow.push('Identify incoming information task event');
  }

  currentManualWorkflow.push('Read and analyze the details manually');

  if (involves.includes('Excel')) {
    currentManualWorkflow.push('Manually copy details and paste them into spreadsheet');
  } else if (involves.includes('CRM')) {
    currentManualWorkflow.push('Manually log and update fields in business software');
  } else {
    currentManualWorkflow.push('Manually enter data into current systems');
  }

  if (inputs.biggestPainPoint.toLowerCase().includes('notify') || inputs.biggestPainPoint.toLowerCase().includes('communication')) {
    currentManualWorkflow.push('Manually notify the department about the completed task');
  } else {
    currentManualWorkflow.push('Close transaction or send follow-up confirmation manually');
  }


  // 2. Suggested Automated Process Steps
  suggestedAutomatedWorkflow.push('System automatically detects and gathers incoming requests');
  suggestedAutomatedWorkflow.push('System extracts and organizes key details automatically');
  
  if (involves.includes('Excel') || involves.includes('CRM')) {
    suggestedAutomatedWorkflow.push('System automatically updates spreadsheets or business software logs');
  } else {
    suggestedAutomatedWorkflow.push('System updates central records automatically');
  }

  suggestedAutomatedWorkflow.push('System handles validation: routes complex cases to staff for quick approval');

  if (involves.includes('Emails') || involves.includes('Chat Support')) {
    suggestedAutomatedWorkflow.push('Sends instant confirmation to client and alerts the team');
  } else {
    suggestedAutomatedWorkflow.push('Sends instant status updates to the responsible team');
  }

  return {
    currentManualWorkflow,
    suggestedAutomatedWorkflow
  };
}
