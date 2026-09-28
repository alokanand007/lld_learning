import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Problems } from './pages/Problems.jsx';
import { ProblemDetails } from './pages/ProblemDetails.jsx';
import { Practice } from './pages/Practice.jsx';
import { Attempts } from './pages/Attempts.jsx';
import { AttemptDetails } from './pages/AttemptDetails.jsx';
import { Code2, Heart } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <ScrollToTop />
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:problemId" element={<ProblemDetails />} />
          <Route path="/practice/:problemId" element={<Practice />} />
          <Route path="/attempts" element={<Attempts />} />
          <Route path="/attempts/:attemptId" element={<AttemptDetails />} />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="text-center py-20 space-y-4">
                <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
                <p className="text-sm text-slate-600">The page you were looking for does not exist.</p>
                <div>
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">LLD Practice Platform</span>
            <span>— Master Object-Oriented & Low-Level Design</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/problems" className="hover:text-slate-900 transition-colors">Problems</Link>
            <Link to="/attempts" className="hover:text-slate-900 transition-colors">My Attempts</Link>
            <span className="text-slate-300">|</span>
            <span>Explainable Architectural Feedback</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
