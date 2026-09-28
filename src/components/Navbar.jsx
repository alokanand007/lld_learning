import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Code2, BookOpen, History, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Product Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-700 text-white shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform">
              <Code2 className="h-5 w-5 text-indigo-200" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                LLD Practice
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                System Design Lab
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" end className={navLinkClasses}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink to="/problems" className={navLinkClasses}>
              <BookOpen className="h-4 w-4" />
              <span>Problems</span>
            </NavLink>
            <NavLink to="/attempts" className={navLinkClasses}>
              <History className="h-4 w-4" />
              <span>My Attempts</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
