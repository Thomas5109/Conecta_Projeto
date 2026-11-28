import { createClient } from 'C:/ProjetoConecta/Conecta_Projeto/apps/api/src/modules/clients/client.service.ts';
import { pool } from 'C:/ProjetoConecta/Conecta_Projeto/apps/api/src/infrastructure/database/pool.ts';
async function test() {
    try {
        console.log('Testing createClient with new UUID logic...');
        const result = await createClient({
            cpf: '06036373104',
            email: 'thomastm5109@gmail.com',
            senha: 'MinhaSenhaForte123!',
            nome: 'Thomas Teste',
            telefone: '(65) 99999-9999',
            data_de_nascimento: '2000-01-01',
            sexo: 'MASCULINO'
        });
        console.log('Success! Created client:', result);
        // Verify in database:
        const userCheck = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [result.id_usuario]);
        console.log('Usuario in DB:', userCheck.rows[0]);
        const clientCheck = await pool.query('SELECT * FROM usuario_cliente WHERE id_cliente = $1', [result.id_cliente]);
        console.log('UsuarioCliente in DB:', clientCheck.rows[0]);
        // Clean up test data so the user can test their real registration from the app
        await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [result.id_usuario]);
        console.log('Test cleanup completed.');
    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        await pool.end();
    }
}
test();