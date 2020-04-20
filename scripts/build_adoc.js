const shell = require('shelljs');
const { spawn } = require('child-process-promise');
const fs = require('fs').promises;
const asciidoctor = require('asciidoctor')();

const source = process.argv[2];

if (!source) {
  console.error(new Error('source asciidoc file is not defined'));
  shell.exit(1);
}

shell.mkdir('-p', 'build');

(async () => {
  try {
    const asciidoc = String(await fs.readFile(source));

    const html = asciidoctor.convert(asciidoc, {
      standalone: true,
      safe: 'safe',
      doctype: 'article',
      attributes: { showtitle: true, icons: 'font' },
    });

    await fs.writeFile('build/output.html', html);

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
