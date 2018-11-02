#!/usr/local/bin/node
const { exec } = require('child_process');
const fs = require('fs');
const pdf = require('html-pdf');
const execa = require('execa');
const config = require('./config.json');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const tempDir = '.temp_repos';
const outputPDF = './output.pdf';
const outputHTML = './output.html';
const params = require('commander');

params
  .version('0.1.0')
  .option('--author [email]', 'Add author email [email]')
  .option('--from [date]', 'Add date from YYYY-MM')
  .option('--to [date]', 'Add date to format YYYY-MM')
  .parse(process.argv);

const author = params.author || 'none';

function dateRange (from, to) {
  const date = new Date();
  const currentMonth = date.getMonth() === 0 ? 12 : ('0' + date.getMonth()).slice(-2);
  const currentYear = currentMonth === 12 ? date.getFullYear() - 1 : date.getFullYear();
  from = from || `${currentYear}-${currentMonth}`;
  to = to || `${currentYear}-${currentMonth}`;

  return ` --date=short \
   --since="${from}-01" \
   --until="${to}-31"`
}
async function main () {
  await Promise.all(config.repos.map(async (repo) => {
    let repoDir = `${__dirname}/${tempDir}/${repo}`

    if (fs.existsSync(repoDir)) {
      console.log(`Fetching ${repo}…`);
      await execa.shell(`git --git-dir=${repoDir}/.git --work-tree=${repoDir}  fetch`);
    } else {
      console.log(`Cloning ${repo}…`);
      await execa.shell(`git clone ${config.url}/${repo}.git ${repoDir}`);
    }
    console.log(`Searching commits of ${author} in ${repo}…`);
    await execa.shell(
      `git \
      --git-dir=${repoDir}/.git \
      --work-tree=${repoDir} \
      log \
      -c \
      --no-merges \
      --all \
      --author=${author} \
      ${dateRange(params.from, params.to)} \
      --color | sed 's/ /\\&nbsp;/g' | node_modules/ansi-to-html/bin/ansi-to-html | perl -pe 's/\n/<br>\n/g' \
      >> ${outputHTML}`);
  }));
}

async function showAuthors () {
  await execa.shell(
    `git \
    --git-dir=${repoDir}/.git \
    --work-tree=${repoDir} \
    log \
    --format='%aE' \
    --all | sort -u`);
}

(async function () {
  if (fs.existsSync(outputHTML)) {
    fs.unlinkSync(outputHTML);
  }
  if (fs.existsSync(outputPDF)) {
    fs.unlinkSync(outputPDF);
  }
  await main();
  const data = await readFile(outputHTML)
  const html = `
    <html>
      <head>
      <style>
        body {
          font-size: 8px;
          font-family: sans-serif;
        }
    </style>
    </head>
    <body>
      ${data}
    </body>
  </html>`;

  console.log('Creating PDF file…');
  pdf.create(html, { format: 'A4' }).toFile(outputPDF, (err, res) => {
    err && console.log(err);
    fs.unlinkSync(outputHTML);
  });
})();
