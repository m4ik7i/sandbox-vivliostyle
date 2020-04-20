const shell = require('shelljs');
const { spawn } = require('child-process-promise');

if (!shell.which('pandoc')) {
  console.error(new Error('pandoc has to be installed'));
  shell.exit(1);
}

const source = process.argv[2];

if (!source) {
  console.error(new Error('source file is not defined'));
  shell.exit(1);
}

shell.mkdir('-p', 'build');

(async () => {
  try {
    await (() => {
      const promise = spawn('pandoc', ['--standalone', '--output', 'build/output.html', source]);
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
        'build/output.html',
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
