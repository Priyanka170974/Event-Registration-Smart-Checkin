import { useCallback, useEffect, useState } from 'react';
import api, { getApiError } from '../services/api';
import { useDataRefresh } from '../context/DataRefreshContext';

export function useApiData(url, { enabled = true, initialData = null } = {}) {
  const { revision } = useDataRefresh();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!enabled || !url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }, [enabled, url]);

  useEffect(() => {
    load();
  }, [load, revision]);

  return { data, loading, error, refetch: load };
}
