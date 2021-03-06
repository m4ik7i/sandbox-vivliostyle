const shell = require('shelljs');
const { spawn } = require('child-process-promise');

if (!shell.which('rst2html5.py')) {
  console.error(new Error('docutils has to be installed'));
  shell.exit(1);
}

const source = process.argv[2];

if (!source) {
  console.error(new Error('source restructuredtext file is not defined'));
  shell.exit(1);
}

shell.mkdir('-p', 'build');

(async () => {
  try {
    await (() => {
      const promise = spawn('rst2html5.py', ['--stylesheet-path', 'minimal.css', source, 'build/output.html']);
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
