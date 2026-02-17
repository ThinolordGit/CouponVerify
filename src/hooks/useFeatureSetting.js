/**
 * src/hooks/useHomePageEnabled.js
 * Hook to check if homepage is enabled from settings
 * Always fetches from API to ensure latest value, uses localStorage as fallback only
 */

import { useAppSettings } from '../context/AppContext';

export const useFeatureSetting = () => {
  const { features = {}, loading, error, refresh, setLocalFeature } = useAppSettings();

  const isLaunchingPushEnabled = !!features.enable_launching_push;

  const setIsLaunchingPushEnabled = (v) => setLocalFeature && setLocalFeature('enable_launching_push', !!v);

  return { isLaunchingPushEnabled, loading, error, refresh, setIsLaunchingPushEnabled };
};

export default useFeatureSetting;
