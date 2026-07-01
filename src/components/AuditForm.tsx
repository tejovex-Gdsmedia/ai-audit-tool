import React, { useState } from 'react';
import type { AuditInputs } from '../types';
import { 
  Building2, 
  AlertCircle 
} from 'lucide-react';

const DEPARTMENTS = [
  'Operations', 'Customer Support', 'Finance', 'HR', 'Marketing', 'Sales', 'IT', 'Legal', 'Other'
];

const INDUSTRIES = [
  'Retail & E-commerce', 'Healthcare', 'Finance & Banking', 'Technology', 'Manufacturing', 
  'Education', 'Real Estate', 'Logistics & Supply Chain', 'Consulting & Professional Services', 'Other'
];

const INTEGRATION_OPTIONS = [
  { id: 'Emails', label: 'Emails' },
  { id: 'Excel', label: 'Spreadsheets (Excel/Google Sheets)' },
  { id: 'PDFs', label: 'PDF Documents' },
  { id: 'CRM', label: 'Business Software (CRM/ERP)' },
  { id: 'Customer Data', label: 'Customer Personal Data' },
  { id: 'Documents', label: 'Word Documents/Text Files' },
  { id: 'Images', label: 'Images/Photos' },
  { id: 'Chat Support', label: 'Live Chat/Messaging' }
];

interface AuditFormProps {
  onSubmit: (inputs: AuditInputs) => void;
  isAnalyzing: boolean;
}

export default function AuditForm({ onSubmit, isAnalyzing }: AuditFormProps) {
  const [inputs, setInputs] = useState<AuditInputs>({
    companyName: '',
    industry: '',
    department: 'Operations',
    employeeRole: '',
    taskDescription: '',
    hoursSpentPerWeek: 10,
    numberOfEmployees: 5,
    taskFrequency: 'Daily',
    involves: [],
    currentSoftware: '',
    biggestPainPoint: '',
    hourlyLaborCost: undefined
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AuditInputs, string>>>({});

  const validate = (): boolean => {
    const tempErrors: Partial<Record<keyof AuditInputs, string>> = {};
    
    if (!inputs.companyName.trim()) tempErrors.companyName = 'Company name is required';
    if (!inputs.industry.trim()) tempErrors.industry = 'Industry selection is required';
    if (!inputs.department.trim()) tempErrors.department = 'Department is required';
    if (!inputs.employeeRole.trim()) tempErrors.employeeRole = 'Employee role is required';
    
    if (!inputs.taskDescription.trim()) {
      tempErrors.taskDescription = 'Process description is required';
    } else if (inputs.taskDescription.trim().length < 15) {
      tempErrors.taskDescription = 'Please describe the process in a bit more detail (at least 15 characters)';
    }

    if (inputs.hoursSpentPerWeek <= 0) {
      tempErrors.hoursSpentPerWeek = 'Hours must be greater than 0';
    }

    if (inputs.numberOfEmployees <= 0) {
      tempErrors.numberOfEmployees = 'Number of employees must be at least 1';
    }

    if (!inputs.biggestPainPoint.trim()) {
      tempErrors.biggestPainPoint = 'Please mention the biggest challenge';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(inputs);
    }
  };

  const handleCheckboxChange = (optionId: string) => {
    setInputs(prev => {
      const involves = prev.involves.includes(optionId)
        ? prev.involves.filter(item => item !== optionId)
        : [...prev.involves, optionId];
      return { ...prev, involves };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left max-w-3xl mx-auto font-sans">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-850">
          <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Identify Your Manual Process</h2>
            <p className="text-sm text-slate-555 dark:text-slate-400 mt-0.5">Answer a few simple questions to find automation opportunities.</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="company-name" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              placeholder="e.g. Apex Products"
              value={inputs.companyName}
              onChange={e => setInputs({ ...inputs, companyName: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? 'border-red-500 focus:ring-red-550/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
            />
            {errors.companyName && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium"><AlertCircle className="h-3.5 w-3.5" /> {errors.companyName}</span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Industry
            </label>
            <select
              id="industry"
              value={inputs.industry}
              onChange={e => setInputs({ ...inputs, industry: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.industry ? 'border-red-500 focus:ring-red-550/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
            >
              <option value="" disabled>Choose your industry...</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            {errors.industry && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium"><AlertCircle className="h-3.5 w-3.5" /> {errors.industry}</span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Department
            </label>
            <select
              id="department"
              value={inputs.department}
              onChange={e => setInputs({ ...inputs, department: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="employee-role" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Who does this task? (Employee Role)
            </label>
            <input
              id="employee-role"
              type="text"
              placeholder="e.g. Sales Executive, Data Entry Clerk"
              value={inputs.employeeRole}
              onChange={e => setInputs({ ...inputs, employeeRole: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.employeeRole ? 'border-red-500 focus:ring-red-550/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
            />
            {errors.employeeRole && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium"><AlertCircle className="h-3.5 w-3.5" /> {errors.employeeRole}</span>
            )}
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <label htmlFor="task-description" className="block text-sm font-bold text-slate-755 dark:text-slate-300">
            Describe your manual process in detail
          </label>
          <textarea
            id="task-description"
            rows={4}
            placeholder="Tell us what you do. (e.g. Every afternoon, I open emails containing customer orders, manually copy order details into our spreadsheet, and notify the delivery team by sending a message.)"
            value={inputs.taskDescription}
            onChange={e => setInputs({ ...inputs, taskDescription: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border ${errors.taskDescription ? 'border-red-500 focus:ring-red-550/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
          />
          {errors.taskDescription && (
            <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium"><AlertCircle className="h-3.5 w-3.5" /> {errors.taskDescription}</span>
          )}
        </div>

        {/* Quantities & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="hours-spent" className="text-sm font-bold text-slate-750 dark:text-slate-300">
                Hours spent per week
              </label>
              <span className="text-sm font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                {inputs.hoursSpentPerWeek} hrs
              </span>
            </div>
            <input
              id="hours-spent"
              type="range"
              min={1}
              max={60}
              value={inputs.hoursSpentPerWeek}
              onChange={e => setInputs({ ...inputs, hoursSpentPerWeek: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="employees-involved" className="text-sm font-bold text-slate-750 dark:text-slate-300">
                Employees on this task
              </label>
              <span className="text-sm font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                {inputs.numberOfEmployees}
              </span>
            </div>
            <input
              id="employees-involved"
              type="range"
              min={1}
              max={50}
              value={inputs.numberOfEmployees}
              onChange={e => setInputs({ ...inputs, numberOfEmployees: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              How often is this done?
            </label>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 w-full overflow-hidden">
              {(['Daily', 'Weekly', 'Monthly'] as const).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setInputs({ ...inputs, taskFrequency: freq })}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer truncate px-1 text-center ${
                    inputs.taskFrequency === freq 
                      ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Does it involve checkboxes */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-750 dark:text-slate-300">
            Does this task involve:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {INTEGRATION_OPTIONS.map(opt => {
              const checked = inputs.involves.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleCheckboxChange(opt.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all cursor-pointer ${
                    checked 
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10'
                  }`}
                >
                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                    checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {checked && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools and pain point */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="current-software" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Current Software Used
            </label>
            <input
              id="current-software"
              type="text"
              placeholder="e.g. Outlook, Excel, Tally"
              value={inputs.currentSoftware}
              onChange={e => setInputs({ ...inputs, currentSoftware: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="labor-cost" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Hourly labor cost per employee <span className="text-xs text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-450 font-extrabold text-base select-none">₹</span>
              <input
                id="labor-cost"
                type="number"
                min={0}
                placeholder="e.g. 250"
                value={inputs.hourlyLaborCost !== undefined ? inputs.hourlyLaborCost : ''}
                onChange={e => setInputs({ ...inputs, hourlyLaborCost: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="biggest-challenge" className="block text-sm font-bold text-slate-750 dark:text-slate-300">
              Biggest challenge
            </label>
            <input
              id="biggest-challenge"
              type="text"
              placeholder="e.g. Takes too much time, typos and manual errors"
              value={inputs.biggestPainPoint}
              onChange={e => setInputs({ ...inputs, biggestPainPoint: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.biggestPainPoint ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'} bg-slate-50 dark:bg-slate-950 text-base focus:outline-none transition-all`}
            />
            {errors.biggestPainPoint && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium"><AlertCircle className="h-3.5 w-3.5" /> {errors.biggestPainPoint}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer text-base"
        >
          {isAnalyzing ? 'Analyzing workflow...' : 'Generate Automation Audit'}
        </button>

      </div>
    </form>
  );
}
