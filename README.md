# Tributum
Save all commits from whole last month for each defined in config file author
to separate files.

## Prepare:
Open config.json file and set up login, password and secret for cookies.

## Setup server:
```
npm install
node index.js (or pm2 start index.js --name tributum)
```

## Usage:
Open http://localhost:3002 and login with credentials from config.json

## TODO
- [x] Add scheduler which will automatically send reports.
- [x] Add date for placeholder.
- [ ] Display logs.
- [x] Clean up style.css file.
- [ ] Clean up code.
