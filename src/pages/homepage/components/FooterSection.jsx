import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../context/I18nContext';

const FooterSection = () => {
  const { t } = useTranslation();
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState('');

  const currentYear = new Date()?.getFullYear();

  const footerLinks = {
    platform: [
      { label: t('common.home'), path: '/homepage' },
      { label: t('homepage.startVerifying'), path: '/coupon-verification' },
      { label: t('homepage.learnMore'), path: '#' },
      { label: 'FAQ', path: '#' }
    ],
    support: [
      { label: t('homepage.helpCenter'), path: '#' },
      { label: t('common.contact'), path: '#' },
      { label: t('homepage.serviceStatus'), path: '#' },
      { label: t('homepage.reportIssue'), path: '#' }
    ],
    legal: [
      { label: t('homepage.legalInfo'), action: () => openLegalModal('mentions') },
      { label: t('homepage.privacyPolicy'), action: () => openLegalModal('privacy') },
      { label: t('homepage.termsOfUse'), action: () => openLegalModal('terms') },
      { label: t('homepage.cookies'), action: () => openLegalModal('cookies') }
    ]
  };

  const socialLinks = [
    { icon: 'Facebook', url: '#', label: 'Facebook' },
    { icon: 'Twitter', url: '#', label: 'Twitter' },
    { icon: 'Linkedin', url: '#', label: 'LinkedIn' },
    { icon: 'Instagram', url: '#', label: 'Instagram' }
  ];

  const openLegalModal = (type) => {
    const content = {
      mentions: t('homepage.legalMentionsText'),
      privacy: `${t('homepage.legalPrivacyText')}\n\n${t('homepage.lastUpdated')} ${new Date()?.toLocaleDateString('en-US')}`,
      terms: `${t('homepage.legalTermsText')}\n\n${t('homepage.lastUpdated')} ${new Date()?.toLocaleDateString('en-US')}`,
      cookies: `${t('homepage.legalCookiesText')}\n\n${t('homepage.lastUpdated')} ${new Date()?.toLocaleDateString('en-US')}`
    };

    setLegalContent(content?.[type] || '');
    setShowLegalModal(true);
  };

  return (
    <>
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-10">
            <div>
              <Link to="/homepage" className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                  <Icon name="ShieldCheck" size={24} color="#FFFFFF" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  CouponVerify
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {t('homepage.footerDescription')}
              </p>
              <div className="flex items-center gap-3">
                {socialLinks?.map((social) => (
                  <a
                    key={social?.label}
                    href={social?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-smooth"
                    aria-label={social?.label}
                  >
                    <Icon name={social?.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
                {t('homepage.footerPlatform')}
              </h3>
              <ul className="space-y-3">
                {footerLinks?.platform?.map((link) => (
                  <li key={link?.label}>
                    <Link
                      to={link?.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks?.support?.map((link) => (
                  <li key={link?.label}>
                    <Link
                      to={link?.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">
                {t('homepage.footerLegal')}
              </h3>
              <ul className="space-y-3">
                {footerLinks?.legal?.map((link) => (
                  <li key={link?.label}>
                    <button
                      onClick={link?.action}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {link?.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                &copy; {currentYear} CouponVerify. {t('common.allRightsReserved')}.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span>{t('common.securePayments')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Icon name="Lock" size={16} className="text-success" />
                  <span>{t('common.sslEncrypted')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {showLegalModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                {t('homepage.legalModalTitle')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLegalModal(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body leading-relaxed">
                {legalContent}
              </pre>
            </div>
            <div className="p-6 border-t border-border">
              <Button
                variant="default"
                onClick={() => setShowLegalModal(false)}
                className="w-full"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FooterSection;