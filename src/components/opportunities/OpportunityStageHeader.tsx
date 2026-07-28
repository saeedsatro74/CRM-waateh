import React from 'react';
import { OpportunityStage, UserRole } from '../../types';
import { Check, Lock, ChevronLeft, ShieldCheck, UserCheck, Award } from 'lucide-react';

export interface StageInfo {
  id: OpportunityStage;
  stepNumber: number;
  label: string;
  roleRequired: UserRole | 'all';
  roleLabel: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}

export const OPPORTUNITY_STAGES: StageInfo[] = [
  {
    id: 'registration',
    stepNumber: 1,
    label: 'ثبت فرصت',
    roleRequired: 'all',
    roleLabel: 'کارشناس فروش',
    activeBg: 'bg-amber-500',
    activeBorder: 'border-amber-500',
    activeText: 'text-amber-700',
  },
  {
    id: 'pricing',
    stepNumber: 2,
    label: 'قیمت‌گذاری',
    roleRequired: 'sales_manager',
    roleLabel: 'مدیر فروش / مالی',
    activeBg: 'bg-blue-600',
    activeBorder: 'border-blue-600',
    activeText: 'text-blue-700',
  },
  {
    id: 'ceo_review',
    stepNumber: 3,
    label: 'بررسی مدیرعامل',
    roleRequired: 'admin',
    roleLabel: 'مدیرعامل (مهندس فتح‌پور)',
    activeBg: 'bg-indigo-600',
    activeBorder: 'border-indigo-600',
    activeText: 'text-indigo-700',
  },
  {
    id: 'internal_marketing',
    stepNumber: 4,
    label: 'بازارگردانی داخلی',
    roleRequired: 'sales_manager',
    roleLabel: 'مدیر فروش (خانم عابدیان)',
    activeBg: 'bg-purple-600',
    activeBorder: 'border-purple-600',
    activeText: 'text-purple-700',
  },
  {
    id: 'proforma',
    stepNumber: 5,
    label: 'پیش‌فاکتور',
    roleRequired: 'sales_manager',
    roleLabel: 'واحد فروش',
    activeBg: 'bg-cyan-600',
    activeBorder: 'border-cyan-600',
    activeText: 'text-cyan-700',
  },
  {
    id: 'technical_proposal',
    stepNumber: 6,
    label: 'پیشنهاد فنی',
    roleRequired: 'sales_manager',
    roleLabel: 'مدیریت فنی',
    activeBg: 'bg-teal-600',
    activeBorder: 'border-teal-600',
    activeText: 'text-teal-700',
  },
  {
    id: 'final_approval',
    stepNumber: 7,
    label: 'تایید نهایی',
    roleRequired: 'admin',
    roleLabel: 'مدیرعامل (تایید و مهر)',
    activeBg: 'bg-emerald-600',
    activeBorder: 'border-emerald-600',
    activeText: 'text-emerald-700',
  },
  {
    id: 'sent',
    stepNumber: 8,
    label: 'ارسال شد',
    roleRequired: 'admin',
    roleLabel: 'تحویل نهایی به مشتری',
    activeBg: 'bg-green-600',
    activeBorder: 'border-green-600',
    activeText: 'text-green-700',
  },
];

export const getStageIndex = (stage: OpportunityStage): number => {
  const found = OPPORTUNITY_STAGES.findIndex((s) => s.id === stage);
  return found !== -1 ? found : 0;
};

interface OpportunityStageHeaderProps {
  currentStage: OpportunityStage;
  onSelectStage?: (stage: OpportunityStage) => void;
  userRole?: UserRole;
  interactive?: boolean;
}

export const OpportunityStageHeader: React.FC<OpportunityStageHeaderProps> = ({
  currentStage,
  onSelectStage,
  userRole = 'sales',
  interactive = false,
}) => {
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full bg-slate-900/90 text-white p-4 rounded-2xl shadow-lg border border-slate-800 dir-rtl overflow-x-auto selection:bg-teal-500 selection:text-white">
      <div className="flex items-center justify-between min-w-[760px] relative gap-2">
        {OPPORTUNITY_STAGES.map((stageItem, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          const canUserAccessStage =
            stageItem.roleRequired === 'all' ||
            userRole === 'admin' ||
            userRole === stageItem.roleRequired;

          return (
            <React.Fragment key={stageItem.id}>
              {/* Stage Node */}
              <div
                onClick={() => {
                  if (interactive && onSelectStage) {
                    onSelectStage(stageItem.id);
                  }
                }}
                className={`flex flex-col items-center flex-1 transition-all ${
                  interactive ? 'cursor-pointer hover:opacity-90' : ''
                }`}
              >
                {/* Circle Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md relative ${
                    isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-950'
                      : isCurrent
                      ? `${stageItem.activeBg} text-white ring-4 ring-teal-500/30 scale-110 animate-pulse`
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="font-extrabold text-sm">{stageItem.stepNumber}</span>
                  ) : (
                    <span className="text-slate-400">{stageItem.stepNumber}</span>
                  )}

                  {!canUserAccessStage && isUpcoming && (
                    <div className="absolute -top-1 -right-1 bg-slate-950 text-slate-400 p-0.5 rounded-full border border-slate-700">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Stage Title */}
                <span
                  className={`mt-2 text-xs font-bold text-center whitespace-nowrap ${
                    isCurrent
                      ? 'text-teal-300 font-black scale-105'
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {stageItem.label}
                </span>

                {/* Responsible Role Badge */}
                <span className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                  {stageItem.roleLabel}
                </span>
              </div>

              {/* Connecting Bar */}
              {idx < OPPORTUNITY_STAGES.length - 1 && (
                <div className="flex-1 h-1 self-center relative -mt-4 mx-1 min-w-[20px]">
                  <div className="absolute inset-0 bg-slate-800 rounded-full" />
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      idx < currentIndex ? 'bg-emerald-500' : 'bg-transparent'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
