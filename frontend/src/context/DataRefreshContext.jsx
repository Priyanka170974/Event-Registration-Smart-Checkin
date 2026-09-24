import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DataRefreshContext = createContext(null);

export function DataRefreshProvider({ children }) {
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const value = useMemo(() => ({ revision, refresh }), [revision, refresh]);
  return <DataRefreshContext.Provider value={value}>{children}</DataRefreshContext.Provider>;
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext);
  if (!context) throw new Error('useDataRefresh must be used inside DataRefreshProvider');
  return context;
}
