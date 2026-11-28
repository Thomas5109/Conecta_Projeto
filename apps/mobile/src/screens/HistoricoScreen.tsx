import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import PerfilReferenciaCard from '../components/PerfilReferenciaCard';
import AlertaRiscoModal from '../components/AlertaRiscoModal';
import {
    atualizarMedicao,
    excluirMedicao,
    observarTodasMedicoes,
} from '../database/helpers/measurementRepository';
import { lerPerfilReferenciaGlicose } from '../services/storage/localData';
import { syncData } from '../services/sync';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import type { MedicaoLocal } from '../types/localData.types';
import type { ContextoGlicose, PerfilReferenciaGlicose } from '../types/glicose.types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { CONTEXTOS_GLICOSE, PERFIS_REFERENCIA_GLICOSE, classificarGlicose } from '../utils/glicoseReference';

interface RascunhoEdicao {
    valor: string;
    pressaoDiastolica: string;
    contexto: ContextoGlicose;
    perfil: PerfilReferenciaGlicose | null;
}

export default function HistoricoScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [medicoes, setMedicoes] = useState<MedicaoLocal[]>([]);
    const [erro, setErro] = useState('');
    const [edicao, setEdicao] = useState<MedicaoLocal | null>(null);
    const [rascunho, setRascunho] = useState<RascunhoEdicao | null>(null);
    const [salvando, setSalvando] = useState(false);

    const [avisoRisco, setAvisoRisco] = useState({
        visivel: false,
        tituloMedicao: '',
        valorMedicao: '',
        motivoRisco: '',
        sincronizado: false,
    });

    useEffect(() => {
        const subscription = observarTodasMedicoes().subscribe((listaAtualizada) => {
            setMedicoes(listaAtualizada);
            setErro('');
        });

        return () => subscription.unsubscribe();
    }, []);

    useFocusEffect(useCallback(() => {
        if (!edicao || edicao.tipo !== 'Glicose') return;
        let ativo = true;
        void lerPerfilReferenciaGlicose().then((perfil) => {
            if (ativo) setRascunho((atual) => (atual ? { ...atual, perfil } : atual));
        });
        return () => { ativo = false; };
    }, [edicao]));

    async function abrirEdicao(medicao: MedicaoLocal) {
        setEdicao(medicao);
        setErro('');
        const atual = medicao.tipo === 'Glicose' ? await lerPerfilReferenciaGlicose() : null;
        const partesValor = medicao.valor.match(/\d+(?:[.,]\d+)?/g) ?? [];
        setRascunho({
            valor: partesValor[0] ?? '',
            pressaoDiastolica: partesValor[1] ?? '',
            contexto: medicao.contexto ?? 'JEJUM',
            perfil: atual,
        });
    }

    async function salvarEdicao() {
        if (!edicao || !rascunho) return;
        setErro('');
        setSalvando(true);

        try {
            let isCritico = false;
            let tituloMedicao = '';
            let valorMedicao = '';
            let motivoRisco = '';

            if (edicao.tipo === 'Glicose') {
                if (!rascunho.perfil) {
                    setErro('Defina o perfil de referência em Configurações para classificar esta medição.');
                    return;
                }
                const valorMgDl = Number(rascunho.valor.replace(',', '.'));
                if (!Number.isFinite(valorMgDl) || valorMgDl <= 0) {
                    setErro('Informe um valor de glicose válido.');
                    return;
                }

                const classificacao = classificarGlicose(valorMgDl, rascunho.perfil, rascunho.contexto);
                isCritico = classificacao.status === 'ACIMA_DA_META' || classificacao.status === 'ABAIXO_DA_META';
                tituloMedicao = 'Glicemia fora da meta de referência';
                valorMedicao = `${valorMgDl} mg/dL`;
                motivoRisco = `${classificacao.rotulo} (${classificacao.faixa})`;

                await atualizarMedicao(edicao.id, {
                    tipo: 'Glicose',
                    valorMgDl,
                    contexto: rascunho.contexto,
                    perfilReferencia: rascunho.perfil,
                    classificacao,
                    isCritico,
                });
            } else {
                let sistolica = Number(rascunho.valor.replace(',', '.'));
                let diastolica = Number(rascunho.pressaoDiastolica.replace(',', '.'));
                if (!Number.isFinite(sistolica) || !Number.isFinite(diastolica) || sistolica <= 0 || diastolica <= 0) {
                    setErro('Informe os valores sistólico e diastólico, separados por /.');
                    return;
                }

                if (sistolica < 30) sistolica *= 10;
                if (diastolica < 30) diastolica *= 10;

                isCritico = sistolica >= 180 || diastolica >= 120;
                tituloMedicao = 'Pressão arterial em nível crítico';
                valorMedicao = `${sistolica}/${diastolica} mmHg`;
                motivoRisco = 'Crise hipertensiva (pressão muito elevada)';

                await atualizarMedicao(edicao.id, {
                    tipo: 'Pressão',
                    sistolica,
                    diastolica,
                    isCritico,
                });
            }

            let sincronizado = false;
            try {
                sincronizado = await syncData();
            } catch (err) {
                console.log('Sync pendente (edição):', err);
            }

            setEdicao(null);
            setRascunho(null);

            if (isCritico) {
                setAvisoRisco({
                    visivel: true,
                    tituloMedicao,
                    valorMedicao,
                    motivoRisco,
                    sincronizado,
                });
            } else {
                Alert.alert(
                    'Medição atualizada',
                    sincronizado
                        ? 'As alterações foram salvas e sincronizadas com a nuvem.'
                        : 'As alterações foram salvas neste aparelho e aguardam sincronização.',
                );
            }
        } catch {
            setErro('Não foi possível atualizar a medição.');
        } finally {
            setSalvando(false);
        }
    }

    function confirmarExclusao(medicao: MedicaoLocal) {
        Alert.alert('Excluir medição?', 'Este registro será removido do histórico deste aparelho.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: () => {
                    void excluirMedicao(medicao.id)
                        .then(() => {
                            Alert.alert('Medição excluída', 'O registro foi removido deste aparelho.');
                        })
                        .catch(() => setErro('Não foi possível excluir a medição.'));
                },
            },
        ]);
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Histórico de medições</Text>
            <Text style={styles.subtitulo}>Registros armazenados neste aparelho.</Text>
            {erro !== '' && !edicao && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            {medicoes.length === 0 ? <Text style={styles.textoVazio}>Nenhuma medição registrada ainda.</Text> : medicoes.map((medicao) => {
                const partesValor = medicao.valor.match(/^(.*?)\s*(mg\/dL|mmHg)$/);
                const acimaMeta = medicao.classificacao?.status === 'ACIMA_DA_META';
                return (
                    <View key={medicao.id} style={[styles.cartao, acimaMeta && styles.cartaoAlertaMeta]}>
                        <Text style={[styles.tituloCartao, acimaMeta && styles.tituloMetaAlta]}>{medicao.tipo === 'Glicose' ? '🩸 Glicose' : '🩺 Pressão arterial'}</Text>
                        <Text style={styles.valorMedicao}>
                            {partesValor?.[1] ?? medicao.valor}
                            {partesValor?.[2] && <Text style={styles.unidadeMedicao}> {partesValor[2]}</Text>}
                        </Text>
                        {acimaMeta && (
                            <View style={styles.badgeRisco} accessibilityLabel="Alerta: risco, medição acima da meta">
                                <Text style={styles.textoBadgeRisco}>⚠️ RISCO</Text>
                            </View>
                        )}
                        {medicao.contexto && <Text style={styles.texto}>Contexto: {CONTEXTOS_GLICOSE.find((c) => c.valor === medicao.contexto)?.rotulo ?? medicao.contexto}</Text>}
                        {medicao.perfilReferencia && <Text style={styles.texto}>Perfil: {PERFIS_REFERENCIA_GLICOSE.find((item) => item.valor === medicao.perfilReferencia)?.rotulo ?? medicao.perfilReferencia}</Text>}
                        {medicao.classificacao && <Text style={[styles.texto, acimaMeta && styles.tituloMetaAlta]}>{medicao.classificacao.rotulo} · {medicao.classificacao.faixa}</Text>}
                        <Text style={styles.texto}>{medicao.data}</Text>
                        <Text style={[styles.texto, { color: medicao.statusSincronizacao === 'ENVIADO' ? '#287A45' : colors.textSecondary }]}>
                            {medicao.statusSincronizacao === 'ENVIADO' ? '✓ Sincronizado' : '● Aguardando sincronização'}
                        </Text>
                        <View style={styles.linha}>
                            <Pressable style={[styles.botaoSecundario, { flex: 1 }]} onPress={() => void abrirEdicao(medicao)} accessibilityRole="button"><Text style={styles.textoBotaoSecundario}>Editar</Text></Pressable>
                            <Pressable style={[styles.botaoSecundario, { flex: 1, borderColor: colors.error }]} onPress={() => confirmarExclusao(medicao)} accessibilityRole="button"><Text style={styles.textoExcluir}>Excluir</Text></Pressable>
                        </View>
                    </View>
                );
            })}

            <Modal visible={edicao !== null} transparent animationType="slide" onRequestClose={() => setEdicao(null)}>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0008', padding: 18 }}>
                    <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: '92%', backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
                        <Text style={styles.titulo}>Editar medição</Text>
                        {edicao && rascunho && <>
                            <Text style={styles.rotulo}>{edicao.tipo === 'Glicose' ? 'Valor da glicose (mg/dL)' : 'Pressão sistólica (máxima)'}</Text>
                            <TextInput style={styles.entrada} value={rascunho.valor} onChangeText={(valor) => setRascunho({ ...rascunho, valor })} keyboardType="decimal-pad" accessibilityLabel={edicao.tipo === 'Glicose' ? 'Valor da glicose em miligramas por decilitro' : 'Pressão sistólica máxima'} />
                            {edicao.tipo === 'Pressão' && <>
                                <Text style={styles.rotulo}>Pressão diastólica (mínima)</Text>
                                <TextInput style={styles.entrada} value={rascunho.pressaoDiastolica} onChangeText={(pressaoDiastolica) => setRascunho({ ...rascunho, pressaoDiastolica })} keyboardType="decimal-pad" accessibilityLabel="Pressão diastólica mínima" />
                            </>}
                            {edicao.tipo === 'Glicose' && <>
                                <PerfilReferenciaCard perfil={rascunho.perfil} onAlterar={() => navigation.navigate('Configuracoes')} />
                                <Text style={styles.rotulo}>Quando foi feita a medição?</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {CONTEXTOS_GLICOSE.map((opcao) => <Pressable key={opcao.valor} style={[styles.chip, { flexBasis: '47%', flexGrow: 1, minHeight: 52 }, rascunho.contexto === opcao.valor && styles.chipSelecionado]} onPress={() => setRascunho({ ...rascunho, contexto: opcao.valor })} accessibilityRole="button" accessibilityState={{ selected: rascunho.contexto === opcao.valor }}><Text style={rascunho.contexto === opcao.valor ? styles.textoChipSelecionado : styles.textoChip}>{opcao.rotulo}</Text></Pressable>)}
                                </View>
                            </>}
                        </>}
                        {edicao && erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
                        <Text style={styles.texto}>A data e o horário originais não podem ser alterados.</Text>
                        <Pressable style={styles.botao} onPress={() => void salvarEdicao()} disabled={salvando} accessibilityRole="button"><Text style={styles.textoBotao}>{salvando ? 'Salvando…' : 'Salvar alterações'}</Text></Pressable>
                        <Pressable style={styles.botaoSecundario} onPress={() => { setEdicao(null); setErro(''); }} accessibilityRole="button"><Text style={styles.textoBotaoSecundario}>Cancelar</Text></Pressable>
                    </ScrollView>
                </View>
            </Modal>

            <AlertaRiscoModal
                visivel={avisoRisco.visivel}
                tituloMedicao={avisoRisco.tituloMedicao}
                valorMedicao={avisoRisco.valorMedicao}
                motivoRisco={avisoRisco.motivoRisco}
                sincronizado={avisoRisco.sincronizado}
                onFechar={() => setAvisoRisco((prev) => ({ ...prev, visivel: false }))}
                onVerHistorico={() => setAvisoRisco((prev) => ({ ...prev, visivel: false }))}
            />
        </MainScreenLayout>
    );
}