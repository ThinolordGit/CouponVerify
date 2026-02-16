import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/I18nContext';

const QuickActionCard = ({ title, description, icon, iconBg, link }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div
      // to={link}
      onClick={ () => { navigate(link); link?.includes("#") && setTimeout(() => { window.location.href = link }, 100); } }
      className="bg-card cursor-pointer border border-border rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} group-hover:scale-110 transition-transform`}>
          <Icon name={icon} size={20} className="sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" color="#FFFFFF" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground mb-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <Icon name="ChevronRight" size={16} className="sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </div>
  );
};

export default QuickActionCard;