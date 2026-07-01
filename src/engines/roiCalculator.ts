import type { AuditInputs, ROIProjection } from '../types';

export function calculateROI(inputs: AuditInputs): ROIProjection {
  const EFFICIENCY_IMPROVEMENT_RATIO = 0.70; // 70% average productivity improvement

  const totalHoursWeekly = inputs.hoursSpentPerWeek * inputs.numberOfEmployees;
  const weeklyHoursSaved = Math.round(totalHoursWeekly * EFFICIENCY_IMPROVEMENT_RATIO * 10) / 10;
  
  // A standard month has 4.33 weeks
  const monthlyHoursSaved = Math.round(weeklyHoursSaved * 4.33 * 10) / 10;
  
  // A standard year has 52 weeks
  const yearlyHoursSaved = Math.round(weeklyHoursSaved * 52 * 10) / 10;

  const productivityImprovementPct = 70; // 70% efficiency boost

  const hourlyRate = inputs.hourlyLaborCost;

  if (hourlyRate !== undefined && hourlyRate > 0) {
    const weeklyCostSavings = Math.round(weeklyHoursSaved * hourlyRate);
    const monthlyCostSavings = Math.round(monthlyHoursSaved * hourlyRate);
    const yearlyCostSavings = Math.round(yearlyHoursSaved * hourlyRate);

    return {
      weeklyHoursSaved,
      monthlyHoursSaved,
      yearlyHoursSaved,
      productivityImprovementPct,
      weeklyCostSavings,
      monthlyCostSavings,
      yearlyCostSavings
    };
  }

  return {
    weeklyHoursSaved,
    monthlyHoursSaved,
    yearlyHoursSaved,
    productivityImprovementPct
  };
}
