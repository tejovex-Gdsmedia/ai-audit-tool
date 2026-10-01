interface RequestBody {
  inputs: {
    companyName: string;
    industry: string;
    department: string;
    employeeRole: string;
    taskDescription: string;
    hoursSpentPerWeek: number;
    numberOfEmployees: number;
    taskFrequency: string;
    involves: string[];
    currentSoftware: string;
    biggestPainPoint: string;
    hourlyLaborCost?: number;
  };
  deterministicData: {
    weeklyHoursSaved: number;
    monthlyHoursSaved: number;
    yearlyHoursSaved: number;
    productivityImprovementPct: number;
    weeklyCostSavings?: number;
    monthlyCostSavings?: number;
    yearlyCostSavings?: number;
    priority: 'High' | 'Medium' | 'Low';
    priorityExplanation: string;
    automationOpportunity: 'High' | 'Medium' | 'Low';
    automationOpportunityExplanation: string;
    defaultWhyImprove: string[];
    defaultCurrentManualWorkflow: string[];
    defaultSuggestedAutomatedWorkflow: string[];
    defaultRecommendedStrategy: string[];
    defaultBusinessBenefits: string[];
    defaultPossibleChallenges: string[];
  };
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API key not configured', fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { inputs, deterministicData } = body;

    const hasFinancialSavings = deterministicData.yearlyCostSavings !== undefined && deterministicData.yearlyCostSavings > 0;
    const financialText = hasFinancialSavings 
      ? `Yearly Value Saved: INR ₹${deterministicData.yearlyCostSavings.toLocaleString('en-IN')}` 
      : 'No financial/hourly cost provided (DO NOT mention or invent any money savings or currency amounts)';

    const prompt = `
You are a senior business process automation consultant preparing a clear, executive-ready consulting audit report for an Indian business owner / SME leader.

CLIENT BUSINESS CONTEXT:
- Company Name: ${inputs.companyName}
- Industry: ${inputs.industry}
- Department: ${inputs.department}
- Role / Team Member: ${inputs.employeeRole}
- Current Manual Task: ${inputs.taskDescription}
- Headcount involved: ${inputs.numberOfEmployees} employee(s)
- Time spent: ${inputs.hoursSpentPerWeek} hours/week per employee
- Frequency: ${inputs.taskFrequency}
- Tools & Files involved: ${inputs.involves.join(', ') || 'General documentation'}
- Existing Software Used: ${inputs.currentSoftware || 'None specified'}
- Biggest Operational Pain Point: ${inputs.biggestPainPoint}

FIXED CALCULATED METRICS (Calculated by verified formulas - NEVER change, modify, or invent these numbers):
- Priority: ${deterministicData.priority}
- Automation Potential: ${deterministicData.automationOpportunity}
- Hours Saved Weekly: ${deterministicData.weeklyHoursSaved} hours
- Hours Saved Monthly: ${deterministicData.monthlyHoursSaved} hours
- Hours Saved Yearly: ${deterministicData.yearlyHoursSaved} hours
- Productivity Improvement: ${deterministicData.productivityImprovementPct}%
- Financial Metric: ${financialText}

STRICT WRITING & TONE RULES:
1. TARGET AUDIENCE: Non-technical Indian business owner / director. Use plain, professional English.
2. NO TECHNICAL JARGON: NEVER mention or use words like: "API", "LLM", "AI model", "Gemini", "OpenAI", "Claude", "OCR", "database", "Supabase", "Zapier", "Make", "n8n", "automation readiness score", "AI confidence", "developer", "code", "technical stack", "scripts", "JSON", "endpoint", "webhook".
3. PRICING & GUARANTEES: NEVER invent package prices, software subscription fees, or make guaranteed financial claims. If hourly labor cost was not provided, DO NOT mention any rupees or money savings.
4. PERSONALIZATION: Craft specific, relevant descriptions that speak directly to ${inputs.companyName}'s ${inputs.department} team doing ${inputs.taskDescription}.

Provide a response strictly matching this JSON schema:
{
  "executiveSummary": "A concise 2-3 sentence executive paragraph detailing the current manual friction for ${inputs.employeeRole}, referencing the exact yearly time saved (${deterministicData.yearlyHoursSaved} hours) ${hasFinancialSavings ? `and estimated INR ${deterministicData.yearlyCostSavings?.toLocaleString('en-IN')} annual value reclaim` : ''}, and showing how the transition resolves '${inputs.biggestPainPoint}'.",
  "whyImprove": [
    "3 to 4 short, punchy reasons why this process needs improvement (e.g. 'Repetitive manual entry', 'Delayed customer response', 'High staff fatigue')"
  ],
  "currentManualWorkflow": [
    "3 to 5 realistic, step-by-step sequential descriptions of how this task is currently performed manually by ${inputs.employeeRole}"
  ],
  "suggestedAutomatedWorkflow": [
    "3 to 5 clear, step-by-step sequential descriptions of how the improved automated process will run seamlessly with human review checkpoints"
  ],
  "recommendedStrategy": [
    "3 to 4 actionable, business-focused strategy bullet points explaining how to structure the workflow"
  ],
  "businessBenefits": [
    "3 to 4 realistic business advantages (e.g. faster turnaround, reduced human errors, capacity to scale without hiring extra staff)"
  ],
  "possibleChallenges": [
    "2 to 3 practical operational considerations (e.g. initial team training on exception handling, standardizing document templates, clear permission setup)"
  ],
  "threeStepRoadmap": [
    {
      "step": 1,
      "title": "Understand & Document Process",
      "description": "Short clear sentence on recording current inputs and decision rules."
    },
    {
      "step": 2,
      "title": "Test with a Small Pilot",
      "description": "Short clear sentence on validating the automated workflow with real sample files."
    },
    {
      "step": 3,
      "title": "Full Team Rollout & Review",
      "description": "Short clear sentence on onboarding the team and monitoring weekly time reclaimed."
    }
  ]
}
`.trim();

    // Call Gemini via standard REST endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error Response:', errText);
      return new Response(JSON.stringify({ error: 'Gemini request failed', fallback: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return new Response(JSON.stringify({ error: 'Empty response from Gemini', fallback: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(candidateText);
    } catch {
      console.error('Failed to parse Gemini JSON output:', candidateText);
      return new Response(JSON.stringify({ error: 'Invalid JSON from Gemini', fallback: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the verified structured personalized data
    return new Response(JSON.stringify({
      success: true,
      personalizedData: parsedResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in generate-report Netlify function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error', fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
