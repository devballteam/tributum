usage: index.js [--from=<date>] [--to=<date>] [--author=<email>] [--output=<path>]
[--authors]

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
