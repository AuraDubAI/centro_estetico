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
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img
              src={imgLogo}
              alt="Logo"
              width={56}
              className="rounded-lg shadow-sm"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Centro Estetico
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Analytics Dashboard
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
              {lastUpdate && (
                <>
                  <span className="text-slate-300">•</span>
                  <p className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border">
                    Aggiornato: {lastUpdate}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="w-full md:w-auto">{rightActions}</div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
};
