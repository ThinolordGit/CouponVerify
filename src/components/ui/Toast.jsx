import React, { useEffect } from 'react';
import Icon from '../AppIcon';

const Toast = ({ 
  id, 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor = {
    success: 'bg-success',
    error: 'bg-destructive',
    info: 'bg-primary',
    warning: 'bg-warning'
  }[type] || 'bg-success';

  const iconName = {
    success: 'Check',
    error: 'AlertCircle',
    info: 'Info',
    warning: 'AlertTriangle'
  }[type] || 'Check';

  const textColor = {
    success: 'text-white',
    error: 'text-white',
    info: 'text-white',
    warning: 'text-white'
  }[type] || 'text-white';

  return (
    <div 
      className={`
        ${bgColor} ${textColor}
        px-4 py-3 rounded-lg shadow-lg 
        flex items-center gap-3
        animate-in fade-in slide-in-from-bottom-3
        duration-300
      `}
      role="alert"
    >
      <Icon name={iconName} size={20} className="flex-shrink-0" />
      <span className="font-medium">{message}</span>
      <button 
        onClick={() => onClose?.(id)}
        className="ml-auto flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <Icon name="X" size={18} />
      </button>
    </div>
  );
};

export default Toast;
