import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from '../context/I18nContext';

const ScrollToTop = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

export default ScrollToTop;