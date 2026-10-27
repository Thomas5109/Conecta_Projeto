import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/routes/AppNavigator';

export default function App() {
    return (
        <NavigationContainer>
            <AppNavigator />
        </NavigationContainer>
    );
}