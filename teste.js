// Configurações da API Google (troque pelos seus valores)
const CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'SUA_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = 'ID_DA_SUA_PLANILHA';

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  return gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    scope: SCOPES,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(() => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      return authInstance.signIn();
    }
  }).catch(err => {
    alert('Erro ao inicializar a API do Google.');
    console.error(err);
  });
}

function converterPDFparaBase64() {
  const file = document.getElementById('pdfInput').files[0];
  if (!file) {
    alert('Selecione um arquivo PDF.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const base64 = reader.result.split(',')[1];
    const blocoTam = 50000;
    const blocos = [];

    for (let i = 0; i < base64.length; i += blocoTam) {
      blocos.push(base64.slice(i, i + blocoTam));
    }

    const container = document.getElementById('blocosContainer');
    container.innerHTML = '';

    blocos.forEach((bloco, index) => {
      const div = document.createElement('div');
      div.className = 'bloco';
      div.innerHTML = `<b>Bloco ${index + 1}</b><br><textarea readonly>${bloco}</textarea><br>`;
      container.appendChild(div);
    });

    enviarBlocosParaSheets(blocos);
  };

  reader.readAsDataURL(file);
}

function enviarBlocosParaSheets(blocos) {
  const values = blocos.map(bloco => [bloco]);
  const body = { values: values };

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: body,
  }).then(response => {
    alert(`Enviados ${response.result.updates.updatedRows} blocos para o Google Sheets!`);
  }).catch(err => {
    alert('Erro ao enviar para o Google Sheets. Veja o console.');
    console.error(err);
  });
}

// Configura os eventos dos botões e inicia API Google
window.onload = () => {
  handleClientLoad();

  document.getElementById('btnConverter').onclick = converterPDFparaBase64;
  document.getElementById('btnLimpar').onclick = () => {
    document.getElementById('blocosContainer').innerHTML = '';
    document.getElementById('pdfInput').value = '';
  };
};
