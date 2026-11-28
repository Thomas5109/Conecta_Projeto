1. Apontar o frontend para a API em produção
Abra o arquivo apps/mobile/.env e atualize a variável da API com o link que o Render gerou para você (certifique-se de não deixar uma barra / no final):

```
EXPO_PUBLIC_API_URL=https://seu-backend-novo.onrender.com
EXPO_PUBLIC_DEMO_MODE=true
```

2. Gerar os arquivos da Web (Build)
No terminal, certifique-se de estar dentro da pasta apps/mobile. O parâmetro -c limpa o cache automaticamente para garantir que o Expo leia a nova URL do .env:

```
npx expo export -c
```
