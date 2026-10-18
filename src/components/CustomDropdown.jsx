import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomDropdown Component
 * Uniform, accessible dropdown with smooth spring/easing animations,
 * rounded-xl trigger with soft teal border, and rounded-2xl dropdown menu with soft shadow.
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih salah satu...',
  icon = null,
  id = null,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'left' // 'left' | 'right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to [{ value, label, badge, icon }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || null;

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white border border-teal-100/90 hover:border-[#80CBC4] rounded-xl text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#80CBC4]/50 transition-all cursor-pointer select-none text-left ${
          isOpen ? 'ring-2 ring-[#80CBC4]/50 border-[#80CBC4] bg-[#F8FAFC]' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-t from-yellow-400 to-yellow-200 text-amber-950 border border-yellow-300 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* Chevron with smooth 180 degree rotation */}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform duration-200 ease-out shrink-0 ${
            isOpen ? 'rotate-180 text-teal-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu with smooth transition */}
      <div
        className={`absolute z-50 mt-1.5 w-full min-w-[200px] bg-white border border-teal-100/80 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto py-1.5 ${
          align === 'right' ? 'right-0' : 'left-0'
        } transition-all duration-200 ease-out origin-top ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        } ${menuClassName}`}
        role="listbox"
      >
        {normalizedOptions.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none text-left ${
                isSelected
                  ? 'bg-[#E8F5E9] text-[#2E7D32] font-black'
                  : 'text-slate-700 hover:bg-teal-50 hover:text-teal-800'
              }`}
              role="option"
              aria-selected={isSelected}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="truncate">{opt.label}</span>
                {opt.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E0F2F1] text-[#00695C] border border-[#B2DFDB] shrink-0">
                    {opt.badge}
                  </span>
                )}
                {opt.subtext && (
                  <span className="text-[11px] text-slate-400 font-normal truncate">
                    • {opt.subtext}
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
