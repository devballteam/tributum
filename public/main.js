document.querySelector('#logout').addEventListener('click', () => location.href='/logout');
//document.querySelector('.control form').submit(() => false);

var ws = new WebSocket("ws://localhost:3102");

ws.onmessage = function (event) {
  const reportWindow = document.querySelector('textarea[name="report"]');
  reportWindow.value = event.data + '\n' + reportWindow.value;
  //if (event.data
  console.log(event);
  //append to window
}

ws.onopen = () => {
  const reportBtn = document.querySelector('#report');
  const reportWindow = document.querySelector('textarea[name="report"]');

  reportBtn.removeAttribute('disabled');
  reportBtn.addEventListener('click', (evt) => {
    const fields = [...document.querySelector('.control form').elements].filter(field => field.tagName !== 'BUTTON');

    if (fields.every(field => field.checkValidity())) {
      evt.preventDefault();
      ws.send(JSON.stringify({
        type: 'message',
        cookie: 'test',
        data: fields.reduce((obj, field) => {
          obj[field.name] = field.value;
          return obj;
        }, {})
      }));

      reportWindow.value = '';
      reportWindow.removeAttribute('hidden');
      reportBtn.disabled = true;
    } else {
      console.log('errror');
    };
  });
};

//ws.close();
