const shell = require('shelljs');
const { spawn } = require('child-process-promise');
const fs = require('fs').promises;
const marked = require('marked');
const hljs = require('highlight.js');
const Mustache = require('mustache');

const source = process.argv[2];

if (!source) {
  console.error(new Error('source markdown file is not defined'));
  shell.exit(1);
}

shell.mkdir('-p', 'build');

(async () => {
  try {
    const markdown = String(await fs.readFile(source));

    const htmlBody = marked(markdown, {
      renderer: new marked.Renderer(),
      highlight: (code, language) => {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        return hljs.highlight(validLanguage, code).value;
      },
      gfm: true,
      breaks: true,
      sanitize: false,
    });

    const style = String(await fs.readFile('node_modules/highlight.js/styles/github.css'));

    const template = String(await fs.readFile('src/template/template.mustache'));

    const html = Mustache.render(template, {
      style,
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
        shell.echo('-n', String(data));
      });
      return promise;
    })();
  } catch (err) {
    console.error(err);
    shell.exit(err.code);
  }
})();
