const { exec } = require('child_process');
const fs = require('fs');
const execa = require('execa');
const config = require('./settings.json');
const tempDir = '.temp_repos';

module.exports = async (month, year, author, output) => {
  for (const repo of config.repos) {
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
      --date=short \
      --since="${year}-${month}-01" \
      --until="${year}-${month}-31" \
      >> ${output}`);
  };
}
