const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

// Encontra a raiz do monorepo (onde está o node_modules principal)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Adiciona a raiz do workspace para o Metro resolver os pacotes
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Configuração específica para o SQLite do WatermelonDB ser empacotado corretamente
config.resolver.sourceExts = [...config.resolver.sourceExts, 'sql'];

module.exports = config;
