import React, { useEffect } from "react";
import Routes from "./Routes";
import PushNotificationPrompt from "./components/PushNotificationPrompt";
import ToastContainer from "./components/ui/ToastContainer";
import { useToast } from "./context/ToastContext";
import { initPushNotifications } from "./services/pushNotificationService";
import settingsService from "./services/settingsService";

function App() {
  const { toasts, removeToast } = useToast();
  
  useEffect(() => {
    // Load and apply site settings (logo, favicon, title prefix, SEO, etc.)
    const applySiteSettings = async () => {
      try {
        const seoSettings = await settingsService.getSeoSettings();
        
        if (seoSettings && Object.keys(seoSettings).length > 0) {
          // Apply site favicon
          if (seoSettings.site_favicon_url) {
            const faviconLink = document.querySelector("link[rel='icon']") || 
                               document.createElement('link');
            faviconLink.rel = 'icon';
            faviconLink.href = seoSettings.site_favicon_url;
            if (!document.querySelector("link[rel='icon']")) {
              document.head.appendChild(faviconLink);
            }
          }

          // Apply site logo to localStorage for header component access
          if (seoSettings.site_logo_url) {
            localStorage.setItem('site_logo_url', seoSettings.site_logo_url);
          }

          // Apply page title prefix
          if (seoSettings.seo_title_prefix) {
            document.title = seoSettings.seo_title_prefix;
            localStorage.setItem('seo_title_prefix', seoSettings.seo_title_prefix);
          }

          // Inject custom head HTML if provided (only scripts and meta tags)
          if (seoSettings.custom_head_html && seoSettings.custom_head_html.trim()) {
            try {
              // Create a temporary container to parse the HTML
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = seoSettings.custom_head_html;
              
              // Append safe elements (meta, script, link tags) to head
              const safeElements = tempDiv.querySelectorAll('meta, link[rel="stylesheet"], script');
              safeElements.forEach(element => {
                const newElement = element.cloneNode(true);
                document.head.appendChild(newElement);
              });
            } catch (error) {
              console.warn('Could not inject custom head HTML:', error);
            }
          }

          // Store all settings for potential component access
          localStorage.setItem('siteSettings', JSON.stringify(seoSettings));
        }
      } catch (error) {
        console.warn('Failed to load site settings:', error);
        // Continue even if settings fail to load
      }
    };

    applySiteSettings();
  }, []);

  useEffect(() => {
    // Initialize push notifications on app mount
    const initPush = async () => {
      try {
        const initialized = await initPushNotifications();
        if (initialized) {
          // console.log('[App] Push notifications initialized');
          // Prompt will handle subscription when user clicks "Enable"
        }
      } catch (error) {
        console.error('[App] Failed to initialize push notifications:', error);
      }
    };

    initPush();
  }, []);

  return (
    <>
      <Routes />
      <PushNotificationPrompt />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default App;
