document.querySelector('#logout').addEventListener('click', () => location.href='/logout');

// Set up websocket connection
const ws = new WebSocket(`ws://${window.wsAddress}:3102`);
ws.onmessage = function (event) {
  const logsTextarea = document.querySelector('textarea[name="logs"]');
  logsTextarea.value += JSON.parse(event.data).data;

  // Keep textarea on bottom
  logsTextarea.scrollTop = logsTextarea.scrollHeight;
}
