import type { AuditInputs, AuditReport, NextStep } from '../types';

interface PersonalizedData {
  executiveSummary?: string;
  whyImprove?: string[];
  currentManualWorkflow?: string[];
  suggestedAutomatedWorkflow?: string[];
  recommendedStrategy?: string[];
  businessBenefits?: string[];
  possibleChallenges?: string[];
  threeStepRoadmap?: NextStep[];
}

/**
 * Clean any prohibited technical jargon defensively if present
 */
function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\b(LLM|API|AI model|Gemini|OpenAI|Claude|Supabase|Zapier|Make\.com|n8n|OCR|endpoint|JSON)\b/gi, 'system')
    .replace(/\b(automation readiness score|AI confidence score)\b/gi, 'efficiency potential');
}

/**
 * Invokes the secure Netlify serverless function to personalize consulting report narrative.
 * Gracefully falls back to the deterministic base report if unavailable.
 */
export async function enrichWithGemini(
  inputs: AuditInputs,
  baseReport: AuditReport
): Promise<AuditReport> {
  try {
    const payload = {
      inputs,
      deterministicData: {
        weeklyHoursSaved: baseReport.estimatedTimeSaved.weeklyHoursSaved,
        monthlyHoursSaved: baseReport.estimatedTimeSaved.monthlyHoursSaved,
        yearlyHoursSaved: baseReport.estimatedTimeSaved.yearlyHoursSaved,
        productivityImprovementPct: baseReport.estimatedTimeSaved.productivityImprovementPct,
        weeklyCostSavings: baseReport.estimatedTimeSaved.weeklyCostSavings,
        monthlyCostSavings: baseReport.estimatedTimeSaved.monthlyCostSavings,
        yearlyCostSavings: baseReport.estimatedTimeSaved.yearlyCostSavings,
        priority: baseReport.priority,
        priorityExplanation: baseReport.priorityExplanation,
        automationOpportunity: baseReport.automationOpportunity,
        automationOpportunityExplanation: baseReport.automationOpportunityExplanation,
        defaultWhyImprove: baseReport.whyImprove,
        defaultCurrentManualWorkflow: baseReport.currentManualWorkflow,
        defaultSuggestedAutomatedWorkflow: baseReport.suggestedAutomatedWorkflow,
        defaultRecommendedStrategy: baseReport.recommendedStrategy,
        defaultBusinessBenefits: baseReport.businessBenefits,
        defaultPossibleChallenges: baseReport.possibleChallenges
      }
    };

    // 12-second timeout controller for seamless responsiveness
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/.netlify/functions/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Netlify function unavailable or errored -> use base deterministic report
      return baseReport;
    }

    const data = await res.json();
    if (!data?.success || !data?.personalizedData) {
      return baseReport;
    }

    const p: PersonalizedData = data.personalizedData;

    // Validate and merge safely
    const personalizedReport: AuditReport = {
      ...baseReport,
      // Personalized narrative fields with deterministic fallback
      executiveSummary: p.executiveSummary && typeof p.executiveSummary === 'string' && p.executiveSummary.trim().length > 10
        ? sanitizeText(p.executiveSummary)
        : baseReport.executiveSummary,

      whyImprove: Array.isArray(p.whyImprove) && p.whyImprove.length > 0
        ? p.whyImprove.map(item => sanitizeText(String(item)))
        : baseReport.whyImprove,

      currentManualWorkflow: Array.isArray(p.currentManualWorkflow) && p.currentManualWorkflow.length > 0
        ? p.currentManualWorkflow.map(item => sanitizeText(String(item)))
        : baseReport.currentManualWorkflow,

      suggestedAutomatedWorkflow: Array.isArray(p.suggestedAutomatedWorkflow) && p.suggestedAutomatedWorkflow.length > 0
        ? p.suggestedAutomatedWorkflow.map(item => sanitizeText(String(item)))
        : baseReport.suggestedAutomatedWorkflow,

      recommendedStrategy: Array.isArray(p.recommendedStrategy) && p.recommendedStrategy.length > 0
        ? p.recommendedStrategy.map(item => sanitizeText(String(item)))
        : baseReport.recommendedStrategy,

      businessBenefits: Array.isArray(p.businessBenefits) && p.businessBenefits.length > 0
        ? p.businessBenefits.map(item => sanitizeText(String(item)))
        : baseReport.businessBenefits,

      possibleChallenges: Array.isArray(p.possibleChallenges) && p.possibleChallenges.length > 0
        ? p.possibleChallenges.map(item => sanitizeText(String(item)))
        : baseReport.possibleChallenges,

      threeStepRoadmap: Array.isArray(p.threeStepRoadmap) && p.threeStepRoadmap.length === 3
        ? p.threeStepRoadmap.map((step, idx) => ({
            step: typeof step.step === 'number' ? step.step : idx + 1,
            title: sanitizeText(String(step.title || `Step ${idx + 1}`)),
            description: sanitizeText(String(step.description || ''))
          }))
        : baseReport.threeStepRoadmap
    };

    return personalizedReport;
  } catch (error) {
    // Network / abort error -> silently fall back to reliable deterministic engine
    console.warn('Personalization fallback activated:', error);
    return baseReport;
  }
}
