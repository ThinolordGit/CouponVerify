import { useAppSettings } from '../context/AppContext';

export const useHomePageEnabled = () => {
  const { features = {}, loading, error, refresh } = useAppSettings();
  const isEnabled = features?.enable_home_page ?? true;
  return { isEnabled, loading, error, refresh };
};

export default useHomePageEnabled;
