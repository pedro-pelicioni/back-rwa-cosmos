const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
const config = require('./deploy-config.local');

// Configuração do deploy
const ftpConfig = {
  user: config.ftp.user,
  password: config.ftp.password,
  host: config.ftp.host,
  port: 21,
  localRoot: __dirname,
  remoteRoot: `/${config.ftp.path}/`,
  include: ['**/*'],
  exclude: [
    'node_modules/**',
    '.git/**',
    '.gitignore',
    'deploy-config.local.js',
    'deploy.js',
    'README.md',
    '.env',
    '.env.local',
    '.env.*.local',
    'deploy-log.txt'
  ],
  deleteRemote: false, // Não excluir arquivos no servidor
  forcePasv: true, // Usar modo PASV
  sftp: false // Usar FTP padrão, não SFTP
};

// Evento de log
ftpDeploy.on('log', (data) => {
  console.log(data);
});

// Evento de upload
ftpDeploy.on('uploaded', (data) => {
  console.log(`Uploaded: ${data.filename}`);
});

// Evento de upload concluído
ftpDeploy.on('upload-error', (data) => {
  console.log(`Error: ${data.err}`);
});

// Iniciar o deploy
console.log('Iniciando deploy via FTP...');
ftpDeploy.deploy(ftpConfig)
  .then(() => console.log('Deploy concluído com sucesso!'))
  .catch(err => console.error('Erro durante o deploy:', err)); 