import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const FAQSection = ({ faqs }) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="HelpCircle" size={24} className="text-secondary" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">
          {t('couponVerification.faqTitle')}
        </h2>
      </div>
      <div className="space-y-3 md:space-y-4">
        {faqs?.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden transition-all duration-250"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-muted/50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm md:text-base font-semibold text-foreground pr-4">
                {faq?.question}
              </span>
              <Icon
                name="ChevronDown"
                size={20}
                className={`text-muted-foreground flex-shrink-0 transition-transform duration-250 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-250 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="p-4 md:p-5 pt-0 md:pt-0 text-sm md:text-base text-muted-foreground leading-relaxed">
                {faq?.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 md:mt-8 p-4 md:p-5 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="MessageCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">
              {t('couponVerification.needMoreHelp')}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t('couponVerification.needMoreHelpDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;