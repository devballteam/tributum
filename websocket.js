const WebSocket = require('ws');

module.exports = {
  startWebsocket: (port) => {
    const wss = new WebSocket.Server({ port });

    function heartbeat() { this.isAlive = true; }

    wss.on('connection', (ws) => {
      console.log('connected');
      ws.isAlive = true;
      ws.on('pong', heartbeat);
      ws.on('message', (message) => {
        console.log('received: %s', message);
        var i = 0;
        var x = setInterval(() => {
          i++
        ws.send('something' + i);
          if (i === 20) {
            clearInterval(x);
          }

        }, 2000);
      });

      ws.send('something');
    });

    const interval = setInterval(() =>  {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, 30000);
  }
}
