const cwd = process.cwd();
const WebSocket = require('ws');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
let wss;

module.exports = {
  startWebsocket: (port) => {
    wss = new WebSocket.Server({ port });

    function heartbeat() { this.isAlive = true; }

    wss.on('connection', async (ws) => {
      const logs = await readFile(`${cwd}/logs`,'utf8');
      ws.isAlive = true;
      ws.on('pong', heartbeat);

      ws && ws.readyState === 1 && ws.send(JSON.stringify({ data: logs }));
    });

    const interval = setInterval(() =>  {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, 30000);
  },
  sendToAll: (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}
