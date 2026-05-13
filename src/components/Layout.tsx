import { ReactNode } from 'react';
import imgLogo from '../assets/logo.jpeg';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  lastUpdate?: string;
  rightActions?: ReactNode;
}

export const Layout = ({
  children,
  title,
  subtitle,
  lastUpdate,
  rightActions,
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 font-sans text-slate-900 selection:bg-blue-100">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Material You Header Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-lg opacity-50"></div>
              <img
                src={imgLogo}
                alt="Logo"
                width={64}
                className="relative rounded-2xl shadow-sm border border-slate-50"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Centro Estetico
              </h1>
              <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full w-fit mt-1.5 border border-blue-100/50">
                Analytics Dashboard
              </span>
            </div>
          </div>
          {rightActions && <div className="w-full md:w-auto">{rightActions}</div>}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              {title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {subtitle && <p className="text-base text-slate-500 font-medium">{subtitle}</p>}
              {lastUpdate && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Aggiornato: {lastUpdate}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          {children}
        </div>
      </div>
    </div>
  );
};
