
Passo 1: Instalar a Vercel CLI

Abra o terminal do seu computador (ou do VS Code) e instale a ferramenta globalmente:

```
npm install -g vercel
```


Passo 2: Fazer login na sua conta

No mesmo terminal, execute o comando de login e siga as instruções que aparecerem (ele abrirá o navegador para você confirmar o acesso):

```
vercel login
```


Passo 3: Vincular e enviar a pasta dist

Navegue até a pasta raiz do seu projeto front-end (onde fica a pasta dist) e siga a ordem abaixo:

```
vercel link
```

O terminal vai fazer algumas perguntas. Selecione a sua conta, confirme que deseja vincular a um projeto existente (Link to existing project? -> Yes) e escolha o nome do seu projeto que já está no ar na Vercel.

```
vercel dist --prod 
```

