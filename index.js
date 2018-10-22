#!/usr/local/bin/node
const { exec } = require('child_process');
const fs = require('fs');
const temp_dir = '.temp_repos';
let config;
const help = `usage: index.js [--from=<date>] [--to=<date>] [--author=<email>] [--output=<path>]
[--show-authors]

Save all commits from whole last month for each defined in config file author
to separate files.

Sample usage:
  ./index.js --author="name@domain.com"  Save file with author commits to file
                                         in current directory.

  ./index.js --from="2018-09"            Save files for each defined authors
                                         with commits from 2018-09-01 to 
                                         end of previous month.

  ./index.js --to="2018-10"              Save files for each defined authors
                                         begin of previous month to 2018-10-31.
`;

function processArgs (args) {
  return args
    .slice(2)
    .reduce((acc, curr) => {
      let captured = /--(\w*)=?(.*)/g.exec(curr);
      if (captured && captured[1] && captured[2]) {
        captured_date = /(\d{4}-\d{1,2})/g.exec(captured[2]);
        if (captured_date) {
          acc[captured[1]] = captured_date[1];
        } else {
          console.log('Not valid date format YYYY-MM:', captured[2]);
        }
      } else if (captured && captured[1])  {
        acc[captured[1]] = true;
      } else {
        console.log('Unsupported argument:', curr);
      }
      return acc;
    }, {});
}

function executeCommand (command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => { err ? reject(err) : resolve(stdout || stderr); });
  });
}

function dateRange (from, to) {
  const date = new Date();
  const currentMonth = date.getMonth() === 0 ? 12 : ('0' + a.getMonth()).slice(-2);
  const currentYear = currentMonth === 12 ? date.getFullYear() - 1 : date.getFullYear();
  from = from || `${currentYear}-${currentMonth}`;
  to = to || `${currentYear}-${currentMonth}`;

  return `
   --date=short \
   --since="${from}-01" \
   --until="${to}-31"`
}

function gitFetch (repo_dir) {
  return `git \
    --git-dir=${repo_dir}/.git \
    --work-tree=${repo_dir} \
    fetch`;
}

function showAuthors (repo_dir) {
  return `git \
    --git-dir=${repo_dir}/.git \
    --work-tree=${repo_dir} \
    log \
    --format='%aN %aE' \
    --all | sort -u`;
}

function gitClone (url, repo) {
  return `git clone ${url}/${repo}.git ${temp_dir}/${repo}`
}

function gitLogToFile (repo_dir, author, output, date_range) {
  const author = 'marek.bogatzki@performgroup.com';
  return `git \
    --git-dir=${repo_dir}/.git \
    --work-tree=${repo_dir} \
    log \
    -c \
    --no-merges \
    --all \
    --author=${author} \
    {date_range}
    >> ${output}`;
} 

function main () {
  config.repos.map((repo) => {
    let dir = `${__dirname}/${temp_dir}/${repo}`
    if (fs.existsSync(dir)) {
      console.log('Fetch:',repo);
      executeCommand(gitFetch(dir))
        .then((data) => console.log(`fetch ${repo} - ok`))
        //.then(() => executeCommand(gitLog(dir)))
        //.then((data) => console.log('log to file - ok' ))
        .catch((error) => console.log('error:', error));
    } else {
      executeCommand(gitClone(config.url, repo))
        .then((data) => console.log(`clone ${repo} - ok`))
        .catch((error) => console.log('error', error));
    }
  });
}


try {
  const params = processArgs(process.argv);
  config = require('./config.json');
  //params.help ? console.log(help) : main(params);

  config.repos.map((repo) => {
    let dir = `${__dirname}/${temp_dir}/${repo}`
    if (fs.existsSync(dir)) {
      executeCommand(showAuthors(dir))
      .then((data) => console.log(`show - ok: ${data}`))
      .catch((error) => console.log('error', error));
    }
  });
} catch(error) {
  console.log(error);
  console.log(help);
}
