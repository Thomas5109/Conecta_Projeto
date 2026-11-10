Conversation Log
consegui dar uploud no apk mobile pele eas, mas quando eu eu fiz o tentei fazer o cadastro de uma conta pelo app pela telas de cadastro o "CadastroScreen.tsx", aconteceu um erro de entrega da id do usuario como nula pelo frontend para o backend, e como o banco de dados não aceia a chave primaria UUID nula, ele dá throw do erro abaixo:

{"level":30,"time":1794281238483,"pid":4460,"hostname":"Thomas","reqId":"req-1","req":{"method":"POST","url":"/clientes","host":"192.168.100.6:3000","remoteAddress":"192.168.100.4","remotePort":57614},"msg":"incoming request"}
{"level":30,"time":1794281238514,"pid":4460,"hostname":"Thomas","reqId":"req-1","res":{"statusCode":400},"responseTime":25.888099999865517,"msg":"request completed"}
{"level":30,"time":1794281250972,"pid":4460,"hostname":"Thomas","reqId":"req-2","req":{"method":"POST","url":"/clientes","host":"192.168.100.6:3000","remoteAddress":"192.168.100.4","remotePort":57614},"msg":"incoming request"}
Erro interno na criação do cliente: error: null value in column "id_usuario" of relation "usuario" violates not-null constraint
    at C:\ProjetoConecta\Conecta_Projeto\node_modules\pg\lib\client.js:694:17
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async criarCliente (C:\ProjetoConecta\Conecta_Projeto\apps\api\src\modules\clients\client.repository.ts:34:33)
    at async createClient (C:\ProjetoConecta\Conecta_Projeto\apps\api\src\modules\clients\client.service.ts:152:16)
    at async Object.createClientController (C:\ProjetoConecta\Conecta_Projeto\apps\api\src\modules\clients\client.controller.ts:11:25) {
  length: 411,
  severity: 'ERROR',
  code: '23502',
  detail: 'Failing row contains (null, 06036373104, thomastm5109@gmail.com, ATIVO, CLIENTE, $2b$10$jeRTLezvMIXrJIw9IembKe981f0396KED4iOCiE1EYmqoTxR3j1Oa, 2026-11-10, 2026-11-10 03:27:31.18871+00, 2026-11-10 03:27:31.18871+00, null).',
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'usuario',
  column: 'id_usuario',
  dataType: undefined,
  constraint: undefined,
  file: 'execMain.c',
  line: '2213',
  routine: 'ReportNotNullViolationError'
}
{"level":30,"time":1794281251250,"pid":4460,"hostname":"Thomas","reqId":"req-2","res":{"statusCode":500},"responseTime":277.87510000006296,"msg":"request completed"}

os dados não foram salvos pelo banco de dados, a logica antida do sistema era o proprio banco de dados usar o SERIAL dele para criar o ID, mas como ele não foi projetado para receber e nem o frontend cria um UUID para enviar acaba acontecendo esse erro. Mude or arquivos necesarios para a criação volta funcional do sistema de cadastro. 
 
client.repository.ts#L1-79
01_usuario_schema.sql#L1-38
02_emergency_contacts_schema.sql#L1-41
CadastroScreen.tsx#L1-150
useCadastro.ts#L1-140
clientApi.ts#L1-9
client.types.ts#L1-23
client.types.ts#L1-20
client.service.ts#L100-160
docker-compose.yml#L1-30
auth.service.ts#L60-88
auth.repository.ts#L1-31
auth.types.ts#L1-16
client.controller.ts#L1-28
client.routes.ts#L1-37
03_medicao_schema.sql#L1-50
04_lembrete_schema.sql#L1-43
05_alarme_schema.sql#L1-61
localData.ts#L30-75
package.json#L1-45
package.json#L1-30
useLogin.ts#L1-53
localData.types.ts#L1-27
client.service.ts#L135-169
client.repository.ts#L1-79
client.repository.ts
client.types.ts#L1-20
client.types.ts
auth.types.ts#L1-16
auth.types.ts
auth.service.ts#L1-30
auth.service.ts
client.types.ts#L1-23
client.types.ts
auth.types.ts#L1-12
auth.types.ts
localData.types.ts#L20-27
localData.types.ts
01_usuario_schema.sql#L1-38
01_usuario_schema.sql
02_emergency_contacts_schema.sql
03_medicao_schema.sql
03_medicao_schema.sql
04_lembrete_schema.sql
05_alarme_schema.sql
05_alarme_schema.sql
client.service.ts#L1-50
test-registration.js
pool.ts#L1-12
test-registration.js
test-auth.js

O problema ocorreu porque as tabelas usuario e usuario_cliente haviam sido alteradas de SERIAL (inteiro auto-incrementado) para VARCHAR(255) (para suporte a identificadores al

import { createClient } from 'C:/ProjetoConecta/Conecta_Projeto/apps/api/src/modules/clients/client.service.ts';
import { autenticarUsuario } from 'C:/ProjetoConecta/Conecta_Projeto/apps/api/src/modules/auth/auth.service.ts';
import { pool } from 'C:/ProjetoConecta/Conecta_Projeto/apps/api/src/infrastructure/database/pool.ts';
async function testAuth() {
    try {
        console.log('Testing createClient + authenticate...');
        const created = await createClient({
            cpf: '06036373104',
            email: 'thomastm5109@gmail.com',
            senha: 'MinhaSenhaForte123!',
            nome: 'Thomas Teste',
            telefone: '(65) 99999-9999',
            data_de_nascimento: '2000-01-01',
            sexo: 'MASCULINO'
        });
        console.log('Client created:', created);
        const authUser = await autenticarUsuario('thomastm5109@gmail.com', 'MinhaSenhaForte123!');
        console.log('Authenticated user:', authUser);
        // Clean up
        await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [created.id_usuario]);
        console.log('Cleanup finished successfully.');
    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        await pool.end();
    }
}
testAuth();