// Configurações da API Google
const CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com'; // substitua pelo seu
const API_KEY = 'SUA_API_KEY'; // substitua pelo seu
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = 'ID_DA_SUA_PLANILHA'; // substitua pelo seu

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    scope: SCOPES,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(() => {
    console.log('API inicializada');
    const authInstance = gapi.auth2.getAuthInstance();

    if (!authInstance.isSignedIn.get()) {
      authInstance.signIn().then(() => {
        console.log('Usuário autenticado');
        document.getElementById('mensagemEnvio').textContent = 'Usuário autenticado. Pode enviar os dados.';
        document.getElementById('mensagemEnvio').style.color = 'green';
      }).catch(err => {
        console.error('Erro no login:', err);
        document.getElementById('mensagemEnvio').textContent = 'Erro ao autenticar. Veja o console.';
        document.getElementById('mensagemEnvio').style.color = 'red';
      });
    } else {
      console.log('Usuário já autenticado');
      document.getElementById('mensagemEnvio').textContent = 'Usuário já autenticado. Pode enviar os dados.';
      document.getElementById('mensagemEnvio').style.color = 'green';
    }
  }).catch(err => {
    console.error('Erro ao inicializar API:', err);
    document.getElementById('mensagemEnvio').textContent = 'Erro ao inicializar API. Veja o console.';
    document.getElementById('mensagemEnvio').style.color = 'red';
  });
}

window.onload = () => {
  handleClientLoad();

  document.getElementById('btnConverter').onclick = converterPDFparaBase64;
  document.getElementById('btnLimpar').onclick = limparBlocos;
};

function converterPDFparaBase64() {
  const file = document.getElementById('pdfInput').files[0];
  const msgDiv = document.getElementById('mensagemEnvio');
  msgDiv.textContent = '';

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

      div.innerHTML = `
        <b>Bloco ${index + 1}</b><br>
        <textarea readonly>${bloco}</textarea><br>
      `;

      container.appendChild(div);
    });

    enviarBlocosParaSheets(blocos);
  };

  reader.readAsDataURL(file);
}

function limparBlocos() {
  document.getElementById('blocosContainer').innerHTML = '';
  document.getElementById('mensagemEnvio').textContent = '';
  document.getElementById('pdfInput').value = '';
}

function enviarBlocosParaSheets(blocos) {
  const msgDiv = document.getElementById('mensagemEnvio');
  const authInstance = gapi.auth2.getAuthInstance();

  if (!authInstance.isSignedIn.get()) {
    msgDiv.textContent = '❌ Usuário não autenticado. Por favor, faça login.';
    msgDiv.style.color = 'red';
    return;
  }

  const values = blocos.map(bloco => [bloco]);
  const body = { values };

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: body,
  }).then(response => {
    const linhas = response.result.updates.updatedRows;
    msgDiv.textContent = `✅ Enviados ${linhas} blocos para o Google Sheets!`;
    msgDiv.style.color = 'green';
    console.log('Envio concluído:', response);
  }).catch(err => {
    msgDiv.textContent = '❌ Erro ao enviar para o Google Sheets. Veja o console.';
    msgDiv.style.color = 'red';
    console.error('Erro no envio:', err);
  });
}
