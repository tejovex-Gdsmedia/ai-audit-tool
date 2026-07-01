# Aegis Consulting - Business Automation Audit Tool

A professional, minimal Business Process Automation Consulting SaaS dashboard designed for small & medium enterprises (SMEs) and consultants in India to evaluate workflows, map manual vs. automated steps, and calculate time saved.

## Features

- **Personal Workspaces**: Secured using Supabase Authentication.
- **Consulting Audit Engine**: Analyzes task description, volume, and frequency to output suitability and prioritization.
- **Workflow Visual Comparison**: Main highlight of the dashboard showing step-by-step current manual flows against suggested automated flows.
- **Conditional Financial ROI**: Dynamically calculates and displays financial value saved *only* when hourly labor cost metrics are supplied.
- **PDF Report Export**: Professional consulting report document download.
- **Zero Technical Terminology**: Built with pure business-centric language suitable for non-technical users.

---

## Required Configuration Inputs from User

Before launching, you must set up your Supabase project parameters. Follow these steps:

### 1. Set Environment Variables
1. Duplicate the `.env.example` file in the root directory and rename it to `.env`.
2. Open `.env` and fill in the following keys with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key-string>
   ```
   *You can find these keys in your Supabase dashboard under **Project Settings** > **API**.*

### 2. Configure Database Tables
Run the SQL migration script located in [schema.sql](file:///c:/Users/hp/OneDrive/Desktop/ai%20audit%20tool/schema.sql) in your Supabase SQL Editor:
1. Navigate to your Supabase Project.
2. Open the **SQL Editor** tab.
3. Paste the contents of `schema.sql` and click **Run**.
4. This will set up your database tables (`profiles`, `audit_reports`) and configure the Row Level Security (RLS) policies so users can only access their own reports.

---

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```
