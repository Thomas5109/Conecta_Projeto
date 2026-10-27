
import bcrypt from "bcryptjs";
import type {CreateClientBody, ClientRow} from "./client.types.js";
import { criarCliente } from "./client.repository.js";

// Orquestra a criação de um cliente:
// faz o hash da senha e delega a persistência ao repository.
export async function createClient(
    data: CreateClientBody,
): Promise<ClientRow> {
    const senhaHash = await bcrypt.hash(data.senha, 10);

    return criarCliente({
        cpf: data.cpf,
        email: data.email,
        senhaHash,
        nome: data.nome,
        telefone: data.telefone,
        data_de_nascimento: data.data_de_nascimento,
        sexo: data.sexo,
    });
}
