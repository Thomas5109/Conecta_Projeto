# Dados locais do aplicativo

Este diretório reúne o conteúdo local editável e o catálogo dos dados que o app persiste no aparelho.

- dicas.json: textos exibidos na tela de dicas. Edite este arquivo para atualizar o conteúdo.
- manifest.json: chaves, campos e telas responsáveis pelos dados locais. Atualize-o junto com os tipos e apps/mobile/src/services/storage/localData.ts quando o formato mudar.

Os registros de cada pessoa (medições, lembretes, contatos e perfil) ficam no armazenamento do dispositivo via AsyncStorage. Eles não devem ser versionados no Git nem gravados nesta pasta em tempo de execução, pois cada instalação do app tem seus próprios dados.

As datas exibidas ao usuário usam o padrão brasileiro (DD/MM/AAAA). O histórico de medições também pode mostrar horário (DD/MM/AAAA HH:MM). Horários de lembretes usam relógio de 24 horas (HH:MM). No cadastro, a data digitada ou selecionada é convertida para AAAA-MM-DD ao enviar para a API.

Ao renomear uma chave ou alterar um formato persistido, implemente uma migração para preservar os dados já salvos nos aparelhos.
