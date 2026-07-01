import type { AuditInputs } from '../types';

export function recommendStrategy(inputs: AuditInputs): string[] {
  const strategy: string[] = [];
  const involves = inputs.involves;

  // Gather based on inputs
  if (involves.includes('Emails') || involves.includes('Chat Support')) {
    strategy.push('Capture incoming inquiries or files automatically to eliminate response delay.');
  } else {
    strategy.push('Consolidate operational information from source folders automatically.');
  }

  strategy.push('Structure and extract important details without manual data entry.');

  if (involves.includes('Excel') || involves.includes('CRM')) {
    strategy.push('Sync extracted data directly into your spreadsheets or business records.');
  } else {
    strategy.push('Organize data inside your central workspace automatically.');
  }

  strategy.push('Set up automatic verification alerts for any unusual or complex cases.');

  if (inputs.biggestPainPoint.toLowerCase().includes('time') || inputs.biggestPainPoint.toLowerCase().includes('slow')) {
    strategy.push('Improve process cycle times to deliver faster updates to clients and stakeholders.');
  } else {
    strategy.push('Reduce transcription mistakes and manual oversight effort.');
  }

  return strategy;
}
