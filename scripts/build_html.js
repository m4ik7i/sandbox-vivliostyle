const { spawn } = require('child-process-promise');

const source = process.argv[2];

if (!source) {
  console.error(new Error('source html file is not defined'));
  process.exit(1);
}

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
        process.stdout.write(data.toString());
      });
      return promise;
    })();
  } catch (err) {
    console.error(err.message);
    process.exit(err.code);
  }
})();
