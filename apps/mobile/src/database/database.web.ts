// Este arquivo é um "dublê" exclusivo para a Web.
// Ele impede que o Expo tente carregar o SQLite e quebre a compilação.
// Como a demonstração usa o localData.web.ts na RAM, este arquivo nunca será executado de verdade.
// ossui uma função "get" de mentira 
// apenas para o empacotador não quebrar ao ler os repositórios.

const bancoDeMentira = {
  get: () => ({}) // Retorna vazio se alguém tentar ler uma tabela
} as any;

export const database = bancoDeMentira;
export default database;