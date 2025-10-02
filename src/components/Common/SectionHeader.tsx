import React from 'react';
import type { ReactElement } from 'react';

interface SectionHeaderProps {
  icon?: React.ElementType;
  title: string | ReactElement;
  subtitle?: string | ReactElement;
  iconBgClass?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle, iconBgClass }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        {Icon ? (
          <div className={`w-12 h-12 ${iconBgClass || 'bg-gradient-to-br from-green-500 to-emerald-600'} rounded-xl flex items-center justify-center shadow-sm`}>
            <Icon size={24} className="text-white" />
          </div>
        ) : null}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle ? <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
