const fs = require('fs').promises;
const { spawn } = require('child-process-promise');
const marked = require('marked');
const Mustache = require('mustache');

const source = process.argv[2];

if (!source) {
  console.error(new Error('source markdown file is not defined'));
  process.exit(1);
}

(async () => {
  try {
    const markdown = String(await fs.readFile(source));

    const htmlBody = marked(markdown, {
      gfm: true,
      breaks: true,
      sanitize: false,
    });

    const template = String(await fs.readFile('src/template/template.mustache'));

    const html = Mustache.render(template, {
      body: htmlBody,
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
        process.stdout.write(String(data));
      });
      return promise;
    })();
  } catch (err) {
    console.error(err);
    process.exit(err.code);
  }
})();
