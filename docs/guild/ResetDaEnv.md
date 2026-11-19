Passo a passo para corrigir e descobrir qualquer erro de conexão
Pegue a URL real do seu servidor no Render

Acesse o dashboard do Render.com e entre no Web Service da sua API.

No topo da página, logo abaixo do nome do serviço, copie o link real gerado para você (algo no formato [https://conecta-api-xxxx.onrender.com](https://conecta-api-xxxx.onrender.com)).

Teste no navegador antes: Cole essa URL real no navegador do seu computador. Como o plano gratuito do Render hiberna o servidor após 15 minutos de inatividade, a primeira requisição leva entre 30 e 50 segundos para "acordar" a API — o que costuma estourar o tempo limite (timeout) do celular na primeira tentativa.

Atualize o apps/mobile/.env

Substitua o link de exemplo pela URL real que você copiou (sem colocar barra / no final):

```
EXPO_PUBLIC_API_URL=https://sua-url-real-do-render.onrender.com
EXPO_PUBLIC_DEMO_MODE=true
```
Reinicie o Metro limpando o cache

Como o Metro armazena o .env em cache na memória, feche o servidor atual no terminal (Ctrl + C) e rode novamente apontando para o development build:

```
npx expo start --dev-client --clear
```
Abra o app de desenvolvimento no seu celular e conecte-se ao servidor que aparecerá na tela.

Como inspecionar o erro exato no terminal

Caso ainda dê falha de conexão após corrigir a URL, adicione um console.log temporário dentro do seu apps/mobile/src/services/api/apiConfig.ts (ou apiClient.ts) para enxergar no terminal do Metro o que o celular está tentando acessar e qual erro exato está retornando:

TypeScript
```
console.log('URL da API carregada:', process.env.EXPO_PUBLIC_API_URL);
```

Quando você tentar fazer login ou cadastro no celular, o terminal do Metro exibirá tanto a URL usada quanto o motivo técnico da falha (por exemplo, Network request failed se estiver sem internet, timeout se o Render estiver acordando, ou 404/500 se a rota ou o banco falharem no servidor — momento em que os logs também passarão a aparecer no painel do Render).