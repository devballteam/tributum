const { exec } = require('child_process');
const cwd = process.cwd();
const fs = require('fs');
const execa = require('execa');
const config = require(`${cwd}/settings.json`);
const logger = require(`${cwd}/helpers/logger`);
const tempDir = '.temp_repos';

module.exports = async (month, year, author, output) => {
  for (const repo of config.repos) {
    let repoDir = `${cwd}/${tempDir}/${repo}`

    if (fs.existsSync(repoDir)) {
      logger(`Fetching ${repo}…`);
      await execa.shell(`git --git-dir=${repoDir}/.git --work-tree=${repoDir}  fetch`);
    } else {
      logger(`Cloning ${repo}…`);
      await execa.shell(`git clone ${config.url}/${repo}.git ${repoDir}`);
    }
    logger(`Searching commits of ${author} in ${repo}…`);
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
