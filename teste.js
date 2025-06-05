// Configurações da API Google
const CLIENT_ID = '734496260492-qhh17ktfpnb64mfpkancs35en04kib49.apps.googleusercontent.com';
const API_KEY = 'A_TUA_API_KEY_REAL';  // << substitui por uma válida
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = '1Y7GNqRW1_iOp7rXK-xn6SqGmQOhWhSOSOdQmWlLlXtI';  // apenas o ID


let isAuthenticated = false;

window.onload = () => {
  document.getElementById('btnConverter').onclick = autenticarEConverter;
  document.getElementById('btnLimpar').onclick = limparBlocos;
};

function autenticarEConverter() {
  const msgDiv = document.getElementById('mensagemEnvio');
  msgDiv.textContent = '🔐 Verificando autenticação...';
  msgDiv.style.color = 'black';

  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        authInstance.signIn().then(() => {
          isAuthenticated = true;
          msgDiv.textContent = '✅ Autenticado com sucesso!';
          msgDiv.style.color = 'green';
          converterPDFparaBase64();
        }).catch(err => {
          msgDiv.textContent = '❌ Erro ao autenticar';
          msgDiv.style.color = 'red';
          console.error('Erro na autenticação:', err);
        });
      } else {
        isAuthenticated = true;
        msgDiv.textContent = '✅ Já autenticado!';
        msgDiv.style.color = 'green';
        converterPDFparaBase64();
      }
    }).catch(err => {
      msgDiv.textContent = '❌ Erro ao inicializar a API. Verifica API KEY e CLIENT_ID.';
      msgDiv.style.color = 'red';
      console.error('Erro na inicialização da API:', err);
    });
  });
}

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
    console.log('Resposta do Sheets:', response);
  }).catch(err => {
    msgDiv.textContent = '❌ Erro ao enviar para o Google Sheets. Veja a configuração da sua GoogleSheet.';
    msgDiv.style.color = 'red';
    console.error('Erro no envio para Sheets:', err);
  });
}

