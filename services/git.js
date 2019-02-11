const cwd = process.cwd();
const fs = require('fs');
const execa = require('execa');
const settings = require(`${cwd}/settings.json`);
const logger = require(`${cwd}/helpers/logger`);
const tempDir = '.temp_repos';

module.exports = {
  updateRepositories: async (repo) => {
    let repoDir = `${cwd}/${tempDir}/${repo}`
    if (fs.existsSync(repoDir)) {
      logger(`Fetching ${repo}…`);
      return await execa.shell(`git --git-dir=${repoDir}/.git --work-tree=${repoDir}  fetch`);
    } else {
      logger(`Cloning ${repo}…`);
      return await execa.shell(`git clone ${settings.url}/${repo}.git ${repoDir}`);
    }
  },
  getReport: async (reportParams) => {
    let { author, repo, year, month, output } = reportParams;
    let repoDir = `${cwd}/${tempDir}/${repo}`
    logger(`Searching commits of ${author} in ${repo}…`);
    return await execa.shell(
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
  }
};
