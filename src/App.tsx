import { useState, useEffect } from 'react';
import type { AuditInputs, AuditReport, HistoricalAudit } from './types';
import ThemeToggle from './components/ThemeToggle';
import AuditForm from './components/AuditForm';
import AuditHistory from './components/AuditHistory';
import ReportDashboard from './components/ReportDashboard';
import { runAuditAnalysis } from './engines/auditCoordinator';
import { exportAuditToPDF } from './utils/pdfGenerator';
import { supabase } from './utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';

import { 
  Building2, 
  CheckCircle,
  FileText,
  AlertCircle,
  X,
  RefreshCcw,
  LogOut,
  User,
  Lock,
  Mail
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Supabase Auth session state
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState('');

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoricalAudit[]>([]);

  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Simple loading steps with zero technical terms
  const loadingSteps = [
    'Gathering workflow details...',
    'Reviewing manual steps and complexity...',
    'Calculating weekly, monthly, and yearly hours saved...',
    'Formulating suggested automated workflow...',
    'Generating implementation roadmap...'
  ];

  // Dark mode side-effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || 'Consultant');
        fetchAudits(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || 'Consultant');
        fetchAudits(session.user.id);
      } else {
        setHistory([]);
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch audits from database
  const fetchAudits = async (userId: string) => {
    if (userId === 'guest-user') {
      const saved = localStorage.getItem('guest_audits');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const { data, error } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audits:', error);
    } else if (data) {
      const loadedHistory: HistoricalAudit[] = data.map(item => ({
        reportId: item.generated_report.reportId || item.id,
        companyName: item.company_name,
        department: item.department,
        taskDescription: item.task_description,
        timestamp: new Date(item.created_at).getTime(),
        userId: item.user_id,
        report: item.generated_report,
        dbId: item.id
      }));
      setHistory(loadedHistory);
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill out all fields.');
      setIsAuthLoading(false);
      return;
    }

    if (authMode === 'signup') {
      if (!authName.trim()) {
        setAuthError('Name is required.');
        setIsAuthLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            full_name: authName
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        setIsAuthLoading(false);
        return;
      }

      if (data.user) {
        // Insert into public.profiles
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: authName,
          email: authEmail
        });
        addToast('Sign up successful!', 'success');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) {
        setAuthError(error.message);
        setIsAuthLoading(false);
        return;
      }
      addToast('Welcome back!', 'success');
    }

    setIsAuthLoading(false);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveReport(null);
    addToast('Logged out of workspace.', 'info');
  };

  const saveReportToDb = async (report: AuditReport) => {
    if (!session?.user) return;

    if (session.user.id === 'guest-user') {
      const newAudit: HistoricalAudit = {
        reportId: report.reportId,
        companyName: report.inputs.companyName,
        department: report.inputs.department,
        taskDescription: report.inputs.taskDescription,
        timestamp: Date.now(),
        userId: session.user.id,
        report: report,
        dbId: report.reportId
      };
      const updatedHistory = [newAudit, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('guest_audits', JSON.stringify(updatedHistory));
      setIsAnalyzing(false);
      setActiveReport(report);
      addToast(`Automation Report ${report.reportId} generated locally!`, 'success');
      return;
    }

    const { data, error } = await supabase
      .from('audit_reports')
      .insert({
        user_id: session.user.id,
        company_name: report.inputs.companyName,
        department: report.inputs.department,
        task_description: report.inputs.taskDescription,
        hours_per_week: report.inputs.hoursSpentPerWeek,
        frequency: report.inputs.taskFrequency,
        generated_report: report
      })
      .select();

    setIsAnalyzing(false);

    if (error) {
      console.error('Error saving report:', error);
      addToast('Failed to save report to database.', 'error');
    } else if (data && data[0]) {
      setActiveReport(report);
      addToast(`Automation Report ${report.reportId} generated!`, 'success');
      fetchAudits(session.user.id);
    }
  };

  const handleAuditSubmit = (inputs: AuditInputs) => {
    if (!session?.user) return;
    setIsAnalyzing(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          
          // Generate final audit report
          const report = runAuditAnalysis(inputs);
          saveReportToDb(report);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleSelectAudit = (report: AuditReport) => {
    setActiveReport(report);
    addToast(`Loaded Report ${report.reportId}`, 'info');
    document.getElementById('report-dashboard-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAudit = async (reportId: string) => {
    if (!session?.user) return;

    if (session.user.id === 'guest-user') {
      const updatedHistory = history.filter(item => item.reportId !== reportId);
      setHistory(updatedHistory);
      localStorage.setItem('guest_audits', JSON.stringify(updatedHistory));
      if (activeReport?.reportId === reportId) {
        setActiveReport(null);
      }
      addToast(`Report deleted`, 'error');
      return;
    }
    
    // Find database UUID
    const auditItem = history.find(item => item.reportId === reportId);
    if (auditItem?.dbId) {
      const { error } = await supabase
        .from('audit_reports')
        .delete()
        .eq('id', auditItem.dbId);

      if (error) {
        console.error('Error deleting report:', error);
        addToast('Failed to delete report.', 'error');
        return;
      }
    }

    setHistory(prev => prev.filter(item => item.reportId !== reportId));
    if (activeReport?.reportId === reportId) {
      setActiveReport(null);
    }
    addToast(`Report deleted`, 'error');
  };

  const handleDownloadPDF = () => {
    if (!activeReport) return;
    addToast('Exporting PDF...', 'info');
    exportAuditToPDF(activeReport);
    addToast('PDF download complete!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-theme text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-50 space-y-2.5 max-w-sm w-full no-print">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 transition-all duration-300 animate-slide-in backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-50/90 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-400' 
                : toast.type === 'error'
                ? 'bg-red-50/90 dark:bg-red-950/20 border-red-500/30 text-red-800 dark:text-red-400'
                : 'bg-indigo-50/90 dark:bg-indigo-950/20 border-indigo-500/30 text-indigo-850 dark:text-indigo-400'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}
            {toast.type === 'info' && <RefreshCcw className="h-5 w-5 shrink-0 animate-spin" />}
            
            <div className="flex-1 text-xs font-semibold leading-normal">{toast.message}</div>
            
            <button onClick={() => removeToast(toast.id)} className="text-slate-404 hover:text-slate-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">
                Aegis Consulting
              </span>
              <span className="text-[10px] block text-indigo-650 dark:text-indigo-400 font-bold -mt-0.5 tracking-wider uppercase">
                Business Automation Audit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            {session && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-350">{userName}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-105 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-12">
        
        {!session ? (
          /* Sleek Custom Login/Sign Up Box */
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {authMode === 'login' ? 'Access Your Workspace' : 'Create Consulting Workspace'}
              </h2>
              <p className="text-sm text-slate-550">
                {authMode === 'login' 
                  ? 'Sign in to generate and view your business process audits.' 
                  : 'Register to start identifying automation opportunities.'}
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-left font-sans">
              {authMode === 'signup' && (
                <div className="space-y-1.5 font-sans">
                  <label htmlFor="auth-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="Enter your name"
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 font-sans">
                <label htmlFor="auth-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@company.com"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label htmlFor="auth-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm text-sm cursor-pointer transition-all mt-2 disabled:opacity-60"
              >
                {isAuthLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Workspace'}
              </button>
            </form>

            <div className="text-center pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const guestSession = {
                    user: {
                      id: 'guest-user',
                      email: 'guest@example.com',
                      user_metadata: {
                        full_name: 'Guest Consultant'
                      }
                    },
                    access_token: 'guest-token'
                  } as any;
                  setSession(guestSession);
                  setUserName('Guest Consultant');
                  const saved = localStorage.getItem('guest_audits');
                  if (saved) {
                    try {
                      setHistory(JSON.parse(saved));
                    } catch (e) {
                      console.error(e);
                    }
                  } else {
                    setHistory([]);
                  }
                  addToast('Welcome! Running in Guest Mode (Local Storage)', 'success');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
              >
                Continue in Guest Mode (Bypass Login)
              </button>
            </div>
          </div>
        ) : (
          /* Dashboard Workspace */
          <div className="space-y-8">
            {/* Title Hero */}
            <div className="text-center space-y-2.5 max-w-2xl mx-auto no-print">
              <h1 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-slate-800 dark:text-white">
                Business Automation Audit
              </h1>
              <p className="text-base text-slate-505">
                Identify operational friction, calculate workload hours saved, and draft automated consulting roadmaps.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
              
              {/* Left Column: Form & History Sidebar */}
              <div className="lg:col-span-4 space-y-6 no-print">
                <AuditForm onSubmit={handleAuditSubmit} isAnalyzing={isAnalyzing} />
                <AuditHistory 
                  history={history} 
                  onSelectAudit={handleSelectAudit} 
                  onDeleteAudit={handleDeleteAudit} 
                />
              </div>

              {/* Right Column: Loading Animation or Report Dashboard */}
              <div className="lg:col-span-8 space-y-6 min-h-[500px]" id="report-dashboard-container">
                {isAnalyzing ? (
                  /* Premium Loading state */
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-[550px] space-y-6 shadow-sm animate-pulse-gentle">
                    <div className="relative flex items-center justify-center">
                      <RefreshCcw className="h-12 w-12 text-indigo-600 animate-spin" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white font-sans">Analyzing Process Flow</h3>
                      <p className="text-xs text-indigo-600 font-bold tracking-wider uppercase">
                        Step {loadingStep + 1} of {loadingSteps.length}
                      </p>
                      <p className="text-sm text-slate-550 dark:text-slate-400 mt-2">
                        {loadingSteps[loadingStep]}
                      </p>
                    </div>
                  </div>
                ) : activeReport ? (
                  /* Report View */
                  <ReportDashboard 
                    report={activeReport} 
                    onDownloadPDF={handleDownloadPDF} 
                    onPrint={() => window.print()}
                  />
                ) : (
                  /* Initial Empty State */
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-[550px] space-y-4 shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-full text-indigo-650 dark:text-indigo-400">
                      <FileText className="h-10 w-10" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Workspace Ready</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Fill in your workflow details on the left form to generate a consulting-grade audit report detailing time saved, automated process steps, and roadmap.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-950 no-print">
        © 2026 Aegis Consulting. Designed for process simplification and automation consulting.
      </footer>
    </div>
  );
}
