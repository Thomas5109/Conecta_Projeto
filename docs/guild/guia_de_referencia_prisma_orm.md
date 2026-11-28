# Guia de Consulta: Prisma ORM no Projeto Conecta

Este guia reúne todos os conceitos, fluxos de instalação/atualização e soluções de erros envolvendo o **Prisma ORM (Prisma 7)** discutidos no desenvolvimento do monorepo `Conecta_Projeto`.

---

## 1. Papel do Prisma ORM na Arquitetura do Projeto

No monorepo `Conecta_Projeto`, a persistência de dados é dividida em duas camadas distintas:

* **Backend (`apps/api`):** Utiliza o **Prisma ORM (v7)** conectado a um banco de dados **PostgreSQL** (gerenciado localmente via Docker Compose). Ele é o responsável pela persistência centralizada na nuvem/servidor.
* **Frontend Mobile (`apps/mobile`):** **Não utiliza o Prisma diretamente.** O armazenamento local offline-first no celular é feito via **WatermelonDB (SQLite)** e **AsyncStorage** (`database.ts` e `localData.ts`), sincronizando os dados com a API via requisições HTTP (`EXPO_PUBLIC_API_URL`).

---

## 2. Instalação, Atualização (`git pull`) e Geração do Client

Os arquivos gerados pelo Prisma dentro de `node_modules` não são versionados no Git (ficam no `.gitignore`). Sempre que você clonar o repositório ou baixar alterações via `git pull` que modifiquem o `schema.prisma` ou as dependências do projeto, é necessário regerar o cliente localmente.

### Passo a passo padrão após um `git pull`:

1. **Alinhar dependências na raiz do monorepo (`Conecta_Projeto`):**
   ```bash
   npm install
   ```
   *Garante que as versões dos pacotes `prisma` e `@prisma/client` estejam sincronizadas com o restante da equipe.*

2. **Gerar o Prisma Client dentro da pasta da API (`apps/api`):**
   ```bash
   cd apps/api
   npx prisma generate
   ```
   *Se o projeto estiver utilizando o arquivo de configuração explícito do Prisma 7, execute apontando para ele:*
   ```bash
   npx prisma generate --config prisma7.config.ts
   ```
   *Verificação:* O terminal deve exibir a confirmação `✔ Generated Prisma Client (...) to ...` indicando o diretório de destino.

3. **Reiniciar o servidor TypeScript no VS Code:**
   * Pressione `Ctrl + Shift + P`
   * Digite `TypeScript: Restart TS Server` e pressione `Enter`.

---

## 3. Troubleshooting: Erro `ts(2305)` ao importar `PrismaClient`

### Sintoma
Após realizar um `git pull`, o TypeScript exibe o seguinte erro no arquivo `apps/api/src/infrastructure/database/Prisma.database.ts` (propagando falhas para repositórios e serviços como `eventoMedicao.repository.ts` e `EventoMedicao.service.ts`):

> `O módulo '"@prisma/client"' não tem nenhum membro exportado 'PrismaClient'. ts(2305)`

### Causas Raiz
1. **Client não regerado:** O pacote `@prisma/client` foi instalado ou atualizado sem a execução do `prisma generate`, deixando apenas arquivos de tipagem vazios no `node_modules`.
2. **Saída (`output`) customizada no Prisma 7:** No Prisma 7, se o bloco `generator client` no `schema.prisma` (ou o `prisma7.config.ts`) definir um caminho `output` personalizado (por exemplo, `../generated/prisma`), a classe `PrismaClient` não será exportada a partir do pacote padrão `@prisma/client`.
3. **Hoisting de `node_modules` no Monorepo:** O `prisma generate` pode ter gerado os arquivos no `node_modules` da raiz (`Conecta_Projeto/node_modules`) enquanto o TypeScript da API está lendo `apps/api/node_modules` (ou vice-versa).
4. **Cache de tipos no editor:** O VS Code mantém definições antigas em memória mesmo após o `prisma generate` concluir.

### Como Resolver

1. Execute `npm install` na raiz (`C:\ProjetoConecta\Conecta_Projeto`).
2. Entre em `apps/api` e rode `npx prisma generate` (ou `npx prisma generate --config prisma7.config.ts`).
3. **Observe o caminho impresso no terminal** após `✔ Generated Prisma Client (...) to ...`.
4. **Inspecione o `apps/api/prisma/schema.prisma`:**
   * Verifique o bloco `generator client`.
   * Se houver uma linha `output = "..."` apontando para uma pasta personalizada, ajuste a importação em `Prisma.database.ts` para apontar para esse diretório (ou alinhe a configuração do `schema.prisma` com a equipe).
   * Confirme que na pasta de destino exibida pelo terminal existe o arquivo `index.d.ts` contendo `export class PrismaClient`.
5. **Limpe o cache do editor:** Execute `TypeScript: Restart TS Server` (`Ctrl + Shift + P`) no VS Code.

---

## 4. Troubleshooting: Erro de Symlink do `prisma-cli` no Windows (`EPERM`) durante `eas build`

### Sintoma
Ao executar `eas build --profile development --platform android` dentro de `apps/mobile`, a build falha antes mesmo de subir para os servidores da Expo com o erro:

> `Reason: EPERM: operation not permitted, symlink 'C:\ProjetoConecta\Conecta_Projeto\apps\api\.agents\skills\prisma-cli' -> 'C:\Users\...\AppData\Local\Temp\...\apps\api\.claude\skills\prisma-cli'`

### Causa Raiz
* Ferramentas e habilidades vinculadas ao `prisma-cli` no backend (`apps/api`) criam **links simbólicos (symlinks)** entre `.claude/skills/prisma-cli` e `.agents/skills/prisma-cli`.
* Como o projeto está estruturado em monorepo, o EAS CLI clona o repositório inteiro (`Conecta_Projeto`) para uma pasta temporária do Windows (`AppData\Local\Temp`) antes de compactá-lo.
* Por padrão, o Windows bloqueia a criação/cópia de symlinks por processos sem privilégios especiais, disparando `EPERM`.

### Como Resolver (Duas soluções complementares)

#### Solução 1: Ativar o Modo de Desenvolvedor do Windows (Recomendado)
Libera a criação de symlinks no Windows para Node, Prisma, Git e EAS sem exigir terminal como Administrador:
1. Abra as **Configurações do Windows** (`Win + I`).
2. Acesse **Sistema > Para desenvolvedores** *(no Windows 10: Atualização e Segurança > Para desenvolvedores)*.
3. Ative a opção **Modo de desenvolvedor**.
4. Reinicie o terminal e execute o comando novamente.

#### Solução 2: Ignorar o backend no build mobile via `.easignore`
Evita que o EAS compacte a pasta `apps/api` e os diretórios de symlinks do Prisma ao compilar o aplicativo Android:
1. Na **raiz do monorepo** (`C:\ProjetoConecta\Conecta_Projeto\.easignore`), crie o arquivo `.easignore`.
2. Adicione o seguinte conteúdo *(atenção: quando o `.easignore` existe, o EAS deixa de ler o `.gitignore`, portanto `node_modules` deve ser listado explicitamente)*:

```text
# Dependências e caches pesados
**/node_modules/
**/.expo/
**/dist/
**/build/

# Ignora o backend e pastas de agentes/symlinks do Prisma na build mobile
apps/api/
**/.agents/
**/.claude/
```

---

## 5. Checklist Rápido para Rodar o Backend com Prisma Localmente

Sempre que precisar testar a integração completa entre o app (mobile/web) e o banco de dados local:

1. **Subir o PostgreSQL (na raiz do monorepo `Conecta_Projeto`):**
   ```bash
   docker compose up -d
   ```
2. **Garantir que o Prisma Client está atualizado (em `apps/api`):**
   ```bash
   npx prisma generate
   ```
3. **Iniciar o servidor da API (em `apps/api`):**
   ```bash
   npm run dev
   ```
   *(Certifique-se de que o servidor escuta em `host: '0.0.0.0'` para aceitar conexões de dispositivos físicos na mesma rede Wi-Fi).*