import { useEffect } from 'react';
import { getBackend } from '@/lib/cloud';
import { initialSync, startAutoBackup } from '@/lib/cloud/sync';
import { useAuth } from '@/store/useAuth';

/** Acompanha o login e mantém o backup em dia. Sem servidor configurado, não faz nada. */
export function CloudSync() {
  useEffect(() => {
    const backend = getBackend();
    if (!backend) {
      useAuth.setState({ status: 'signedOut' });
      return;
    }
    let lastUid: string | null = null;
    const stopAuth = backend.onChange((user) => {
      if (!user) {
        lastUid = null;
        useAuth.setState({ status: 'signedOut', user: null, sync: 'idle', ready: false, choice: null, lastBackupAt: null });
        return;
      }
      useAuth.setState({ status: 'signedIn', user });
      if (lastUid !== user.uid) {
        lastUid = user.uid;
        void initialSync(user.uid);
      }
    });
    const stopBackup = startAutoBackup();
    return () => {
      stopAuth();
      stopBackup();
    };
  }, []);

  return null;
}
