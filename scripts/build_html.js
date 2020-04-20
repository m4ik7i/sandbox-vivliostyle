const shell = require('shelljs');
const { spawn } = require('child-process-promise');

const source = process.argv[2];

if (!source) {
  console.error(new Error('source html file is not defined'));
  shell.exit(1);
}

shell.mkdir('-p', 'build');

(async () => {
  try {
    await (() => {
      const promise = spawn('./node_modules/.bin/vivliostyle', [
        'build',
        '--book',
        '--output',
        'build/output.pdf',
        source,
      ]);
      promise.childProcess.stdout.on('data', (data) => {
        shell.echo('-n', String(data));
      });
      return promise;
    })();
  } catch (err) {
    console.error(err.message);
    shell.exit(err.code);
  }
})();
