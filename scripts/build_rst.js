const shell = require('shelljs');
const { spawn } = require('child-process-promise');

if (!shell.which('sphinx-build')) {
  console.error(new Error('sphinx has to be installed'));
  shell.exit(1);
}

const source = process.argv[2];

if (!source) {
  console.error(new Error('source dir is not defined'));
  shell.exit(1);
}

shell.mkdir('-p', 'build');

(async () => {
  try {
    await (() => {
      const promise = spawn('sphinx-build', ['-b', 'singlehtml', source, 'build/sphinx']);
      promise.childProcess.stdout.on('data', (data) => {
        shell.echo('-n', String(data));
      });
      return promise;
    })();
    await (() => {
      const promise = spawn('./node_modules/.bin/vivliostyle', [
        'build',
        '--book',
        '--output',
        'build/output.pdf',
        'build/sphinx/index.html',
      ]);
      promise.childProcess.stdout.on('data', (data) => {
        shell.echo('-n', String(data));
      });
      return promise;
    })();
  } catch (err) {
    console.error(err);
    shell.exit(err.code);
  }
})();
