import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const InstructionsSection = ({ instructions }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="BookOpen" size={24} className="text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">
          {t('couponVerification.instructionsTitle')}
        </h2>
      </div>
      <div className="prose prose-sm md:prose-base max-w-none">
        <div className="space-y-4 md:space-y-5">
          {instructions?.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm md:text-base flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground m-[0!important]">
                  {instruction?.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {instruction?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 md:mt-8 p-4 md:p-5 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">
              {t('couponVerification.importantToKnow')}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t('couponVerification.importantToKnowDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsSection;