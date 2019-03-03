document.querySelector('#logout').addEventListener('click', () => location.href='/logout');

// Set up websocket connection
const ws = new WebSocket(`ws://${window.wsAddress}:3102`);
ws.onopen = function () {
  document.getElementById('report').disabled = false;
};
ws.onmessage = function (event) {
  const logsTextarea = document.querySelector('textarea[name="logs"]');
  logsTextarea.value += JSON.parse(event.data).data;

  // Keep textarea on bottom
  logsTextarea.scrollTop = logsTextarea.scrollHeight;
}

document.querySelector('#reportForm').addEventListener('submit', function (evt) {
  evt.preventDefault();
  const formDataObj = {};
  new FormData(this).forEach((value, key) => {
    formDataObj[key] = value;
  });

  fetch('/report', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formDataObj)
  });
  return false;
});
