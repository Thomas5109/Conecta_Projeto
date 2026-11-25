import { useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/routes/AppNavigator';
import { syncData } from './src/services/sync';

export default function App() {
    useEffect(() => {
        void syncData().catch((err) => console.log('Sync pendente (boot):', err));

        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                void syncData().catch((err) => console.log('Sync pendente (active):', err));
            }
        });

        return () => subscription.remove();
    }, []);

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}