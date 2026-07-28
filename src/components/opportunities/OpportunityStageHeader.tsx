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
    label: 'ثبت اولیه و اسناد',
    roleRequired: 'all',
    roleLabel: 'کارشناس فروش',
    activeBg: 'bg-amber-500',
    activeBorder: 'border-amber-500',
    activeText: 'text-amber-700',
  },
  {
    id: 'pricing',
    stepNumber: 2,
    label: 'قیمت‌گذاری و شرایط',
    roleRequired: 'sales_manager',
    roleLabel: 'مدیر فروش / مدیرعامل',
    activeBg: 'bg-blue-600',
    activeBorder: 'border-blue-600',
    activeText: 'text-blue-700',
  },
  {
    id: 'technical_proposal',
    stepNumber: 3,
    label: 'پیشنهاد فنی',
    roleRequired: 'sales_manager',
    roleLabel: 'مدیریت فنی',
    activeBg: 'bg-teal-600',
    activeBorder: 'border-teal-600',
    activeText: 'text-teal-700',
  },
  {
    id: 'proforma',
    stepNumber: 4,
    label: 'پیشنهاد مالی',
    roleRequired: 'sales_manager',
    roleLabel: 'واحد فروش',
    activeBg: 'bg-cyan-600',
    activeBorder: 'border-cyan-600',
    activeText: 'text-cyan-700',
  },
  {
    id: 'final_approval',
    stepNumber: 5,
    label: 'تایید نهایی و صدور رسمی',
    roleRequired: 'admin',
    roleLabel: 'مدیرعامل (تایید، مهر و ارسال)',
    activeBg: 'bg-emerald-600',
    activeBorder: 'border-emerald-600',
    activeText: 'text-emerald-700',
  },
];

export const getStageIndex = (stage: OpportunityStage): number => {
  if (stage === 'ceo_review' || stage === 'internal_marketing') return 1;
  if (stage === 'sent') return 4;
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
    <div className="w-full bg-slate-900/90 text-white px-3 py-2 rounded-xl shadow-md border border-slate-800 dir-rtl overflow-x-auto selection:bg-teal-500 selection:text-white">
      <div className="flex items-center justify-between min-w-[620px] relative gap-1.5">
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
                {/* Circle Icon Badge & Label Container */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm relative ${
                      isCompleted
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-950'
                        : isCurrent
                        ? `${stageItem.activeBg} text-white ring-2 ring-teal-500/40 scale-105`
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span className="font-extrabold text-xs">{stageItem.stepNumber}</span>
                    )}

                    {!canUserAccessStage && isUpcoming && (
                      <div className="absolute -top-1 -right-1 bg-slate-950 text-slate-400 p-0.5 rounded-full border border-slate-700">
                        <Lock className="w-2 h-2" />
                      </div>
                    )}
                  </div>

                  {/* Stage Title */}
                  <span
                    className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${
                      isCurrent
                        ? 'text-teal-300 font-black'
                        : isCompleted
                        ? 'text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {stageItem.label}
                  </span>
                </div>
              </div>

              {/* Connecting Line */}
              {idx < OPPORTUNITY_STAGES.length - 1 && (
                <div className="flex-1 h-0.5 self-center relative mx-1 min-w-[14px]">
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
