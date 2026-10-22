import { useCallback } from 'react';
import { LocalStorageKeys } from 'aries-data-provider';

export default function useSetFilesToDelete() {
  const setFilesToDelete = useCallback(
    (files: Record<string, unknown>) =>
      localStorage.setItem(LocalStorageKeys.FILES_TO_DELETE, JSON.stringify(files)),
    [],
  );
  return setFilesToDelete;
}
