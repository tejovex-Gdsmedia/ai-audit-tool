import { useState } from 'react';
import type { AuditReport } from '../types';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  ThumbsUp,
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface ReportDashboardProps {
  report: AuditReport;
  onDownloadPDF: () => void;
  onPrint: () => void;
}

export default function ReportDashboard({ report, onDownloadPDF, onPrint }: ReportDashboardProps) {
  const [copied, setCopied] = useState(false);

  const {
    reportId,
    inputs,
    executiveSummary,
    automationOpportunity,
    automationOpportunityExplanation,
    whyImprove,
    currentManualWorkflow,
    suggestedAutomatedWorkflow,
    estimatedTimeSaved,
    recommendedStrategy,
    businessBenefits,
    possibleChallenges,
    priority,
    priorityExplanation,
    threeStepRoadmap,
    disclaimer
  } = report;

  const hasCostSavings = inputs.hourlyLaborCost !== undefined && inputs.hourlyLaborCost > 0;

  const handleCopy = async () => {
    const plainTextReport = `
AEGIS AUTOMATION CONSULTING REPORT
Report ID: ${reportId}
Company: ${inputs.companyName}
Workflow: ${inputs.employeeRole} - ${inputs.taskDescription}

EXECUTIVE SUMMARY
${executiveSummary}

AUTOMATION OPPORTUNITY: ${automationOpportunity}
${automationOpportunityExplanation}

ESTIMATED TIME SAVED:
- Weekly: ${estimatedTimeSaved.weeklyHoursSaved} hours
- Monthly: ${estimatedTimeSaved.monthlyHoursSaved} hours
- Yearly: ${estimatedTimeSaved.yearlyHoursSaved} hours
${hasCostSavings ? `- Estimated Value Saved: ₹${estimatedTimeSaved.yearlyCostSavings?.toLocaleString('en-IN')} per year` : ''}

BUSINESS BENEFITS:
${businessBenefits.map(b => `✔ ${b}`).join('\n')}

CHALLENGES:
${possibleChallenges.map(c => `• ${c}`).join('\n')}

PRIORITY: ${priority}
${priorityExplanation}

DISCLAIMER:
${disclaimer}
    `.trim();

    try {
      await navigator.clipboard.writeText(plainTextReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div id="audit-report-root" className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto font-sans">
      
      {/* Action Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400">
              AUDIT REPORT: {reportId}
            </span>
            <span className="text-xs text-slate-400">
              Date: {new Date(report.timestamp).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            Automation Report for {inputs.companyName}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Role: {inputs.employeeRole} ({inputs.department} Department)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-405 border border-indigo-150/40 hover:bg-indigo-100/30 transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Executive Summary
        </h3>
        <p className="text-base text-slate-655 dark:text-slate-350 leading-relaxed font-normal">
          {executiveSummary}
        </p>
      </div>

      {/* 2. Process Comparison (Moved here to be the main highlight) */}
      <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/10 dark:from-indigo-950/10 dark:to-purple-950/5 p-8 rounded-2xl border-2 border-indigo-100 dark:border-indigo-950 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-950">
          <div>
            <h3 className="text-2xl font-black text-indigo-950 dark:text-indigo-200">Process Comparison</h3>
            <p className="text-sm text-slate-500 mt-1">See how automation transforms your manual workload.</p>
          </div>
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Highlight
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
          
          {/* Current Manual Process */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-red-500 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Current Manual Process
            </h4>
            <div className="flex flex-col items-center space-y-3">
              {currentManualWorkflow.map((step, idx) => (
                <div key={idx} className="w-full flex flex-col items-center">
                  <div className="w-full p-4 bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl text-center shadow-sm">
                    <span className="text-xs font-bold text-red-400 block mb-1">Step {idx + 1}</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">{step}</p>
                  </div>
                  {idx < currentManualWorkflow.length - 1 && (
                    <div className="py-2 text-red-300">
                      <ArrowDown className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Automated Process */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-emerald-500 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Suggested Improved Process
            </h4>
            <div className="flex flex-col items-center space-y-3">
              {suggestedAutomatedWorkflow.map((step, idx) => (
                <div key={idx} className="w-full flex flex-col items-center">
                  <div className="w-full p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center shadow-sm">
                    <span className="text-xs font-bold text-emerald-450 block mb-1">Step {idx + 1}</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-355">{step}</p>
                  </div>
                  {idx < suggestedAutomatedWorkflow.length - 1 && (
                    <div className="py-2 text-emerald-300">
                      <ArrowDown className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Opportunity & Priority Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Opportunity Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Automation Opportunity
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-3 w-3 rounded-full ${
                automationOpportunity === 'High' ? 'bg-emerald-500' : automationOpportunity === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{automationOpportunity}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {automationOpportunityExplanation}
            </p>
          </div>
        </div>

        {/* Priority Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Recommended Priority
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-3 w-3 rounded-full ${
                priority === 'High' ? 'bg-indigo-600' : priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{priority} Priority</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {priorityExplanation}
            </p>
          </div>
        </div>

      </div>

      {/* 4. Why This Process Can Be Improved */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Why This Process Can Be Improved</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {whyImprove.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <span className="text-indigo-600 font-extrabold text-sm">•</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recommended Strategy & Business Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strategy Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Recommended Automation Strategy
          </h3>
          <ul className="space-y-3">
            {recommendedStrategy.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-350">
                <ChevronRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" /> Business Benefits
          </h3>
          <ul className="space-y-3">
            {businessBenefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-655 dark:text-slate-350">
                <span className="text-emerald-500 font-bold shrink-0">✔</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
      </div>
    </div>

      {/* 6. Estimated Time Saved */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Estimated Time Saved
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Weekly Time Saved</span>
            <span className="text-3xl font-black text-slate-850 dark:text-white block mt-1">{estimatedTimeSaved.weeklyHoursSaved} hours</span>
            {hasCostSavings && (
              <span className="text-xs text-emerald-500 font-bold block mt-1">Value saved: ₹{estimatedTimeSaved.weeklyCostSavings?.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Monthly Time Saved</span>
            <span className="text-3xl font-black text-slate-850 dark:text-white block mt-1">{estimatedTimeSaved.monthlyHoursSaved} hours</span>
            {hasCostSavings && (
              <span className="text-xs text-emerald-500 font-bold block mt-1">Value saved: ₹{estimatedTimeSaved.monthlyCostSavings?.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-center">
            <span className="text-xs text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider block">Yearly Time Saved</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">{estimatedTimeSaved.yearlyHoursSaved} hours</span>
            {hasCostSavings && (
              <span className="text-xs text-emerald-500 font-bold block mt-1">Value saved: ₹{estimatedTimeSaved.yearlyCostSavings?.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>

      {/* 7. Challenges */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Possible Challenges to Consider
        </h3>
        <ul className="space-y-3">
          {possibleChallenges.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-350">
              <span className="text-amber-500 text-base shrink-0 mt-0.5">•</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 8. Action Plan */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-sans">Simple 3-Step Action Plan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {threeStepRoadmap.map((step) => (
            <div key={step.step} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 relative">
              <div className="text-5xl font-black text-indigo-100 dark:text-slate-850 absolute top-2 right-4 select-none">
                0{step.step}
              </div>
              <div className="relative space-y-2 font-sans">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Step 0{step.step}</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-250/20 dark:border-slate-850 rounded-2xl text-xs text-slate-405 italic leading-relaxed text-center">
        {disclaimer}
      </div>

    </div>
  );
}
