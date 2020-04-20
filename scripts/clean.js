const shell = require('shelljs');

process.chdir('build');
shell.rm('-rf', shell.ls());
