import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { localDataStyles as styles } from '../theme/localDataStyles';
import Rodape from './Rodape';

interface MainScreenLayoutProps {
    children: ReactNode;
}

export default function MainScreenLayout({ children }: MainScreenLayoutProps) {
    return (
        <SafeAreaView style={styles.tela}>
            <ScrollView
                contentContainerStyle={styles.conteudo}
                keyboardShouldPersistTaps="handled"
            >
                {children}
            </ScrollView>
            <Rodape />
        </SafeAreaView>
    );
}
