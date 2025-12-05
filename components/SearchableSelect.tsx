
import React, { useState, useEffect, useRef } from 'react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
  image?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = "Seleccionar...", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (option.subLabel && option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div 
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-2 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-slate-400 transition-shadow"
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
        }}
      >
        <span className={`block truncate text-sm ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
             <input 
                type="text"
                autoFocus
                className="w-full bg-white text-slate-900 border border-gray-300 rounded p-1.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder-slate-400"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
             />
          </div>
          {filteredOptions.length === 0 ? (
             <div className="text-slate-500 cursor-default select-none relative py-2 px-4 italic bg-white">No hay resultados</div>
          ) : (
             filteredOptions.map((option) => (
               <div
                 key={option.value}
                 className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-50 text-slate-900 bg-white border-b border-gray-50 last:border-0"
                 onClick={() => {
                   onChange(option.value);
                   setIsOpen(false);
                   setSearchTerm('');
                 }}
               >
                 <div className="flex items-center">
                    {option.image && <img src={option.image} alt="" className="h-6 w-6 rounded-full mr-2 object-cover border border-gray-200" />}
                    <div className="flex flex-col">
                        <span className="block truncate font-medium">{option.label}</span>
                        {option.subLabel && <span className="text-xs text-slate-400 truncate hidden sm:block">{option.subLabel}</span>}
                    </div>
                 </div>
               </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};
