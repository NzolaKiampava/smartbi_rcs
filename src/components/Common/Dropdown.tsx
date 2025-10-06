import React, { useEffect, useRef } from 'react';

type DropdownProps = {
  anchor?: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'right' | 'left';
};

const Dropdown: React.FC<DropdownProps> = ({ open, onClose, children, position = 'right' }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className={`absolute mt-2 ${position === 'right' ? 'right-0' : 'left-0'} z-50`}> 
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[180px]">
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
