// src/hooks/useAutoSync.ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { syncData } from '../services/sync';

export function useAutoSync() {
    const estavaOffline = useRef(false);

    useEffect(() => {
    // Garante envio imediato se o app abrir com pendências e já tiver internet
        void syncData().catch(() => {});

        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);
            if (online && estavaOffline.current) {
                void syncData().catch(() => {});
            }
            estavaOffline.current = !online;
        });

        const subscriptionAppState = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' && !estavaOffline.current) {
                void syncData().catch(() => {});
            }
        });

        return () => {
            unsubscribeNetInfo();
            subscriptionAppState.remove();
            };
    }, []);
}