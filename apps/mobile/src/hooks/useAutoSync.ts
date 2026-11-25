import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { syncData } from '../services/sync';

export function useAutoSync() {
    const estavaOffline = useRef(false);

    useEffect(() => {
        // 1. Dispara ao abrir o app (cold start)
        void syncData().catch((err) => console.log('Sync pendente (boot):', err));

        // 2. Dispara em tempo real quando o Wi-Fi ou dados móveis reconectam
        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);

            if (online && estavaOffline.current) {
                void syncData().catch((err) => console.log('Sync pendente (reconexão):', err));
            }

            estavaOffline.current = !online;
        });

        // 3. Dispara ao voltar para o app após minimizar ou ir às configurações
        const subscriptionAppState = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' && !estavaOffline.current) {
                void syncData().catch((err) => console.log('Sync pendente (active):', err));
            }
        });

        return () => {
            unsubscribeNetInfo();
            subscriptionAppState.remove();
        };
    }, []);
}