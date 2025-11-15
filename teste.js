// --- CONFIGURAÇÃO (usa estas chaves reais com cuidado!) ---
const CLIENT_ID = '734435en04kib49.apps.googleusercontent.com';
const API_KEY = 'GOCSPX-Folqx5IOd4Q';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = '1Y7GNq'
let isAuthenticated = false;

window.onload = () => {
  document.getElementById('btnConverter').onclick = autenticarEConverter;
  document.getElementById('btnLimpar').onclick = limparBlocos;
};

// Autentica e chama função para converter e enviar
function autenticarEConverter() {
  const msgDiv = document.getElementById('mensagemEnvio');
  msgDiv.textContent = '🔐 A autenticar...';
  msgDiv.style.color = 'black';

  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
      const auth = gapi.auth2.getAuthInstance();

      if (!auth.isSignedIn.get()) {
        auth.signIn().then(() => {
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
      msgDiv.textContent = '❌ Erro ao inicializar a API. Verifica a API KEY, CLIENT_ID e permissões.';
      msgDiv.style.color = 'red';
      console.error('Erro ao inicializar a API:', err);
    });
  });
}

// Lê o PDF e divide em blocos base64
function converterPDFparaBase64() {
  const file = document.getElementById('pdfInput').files[0];
  const msgDiv = document.getElementById('mensagemEnvio');
  msgDiv.textContent = '';

  if (!file) {
    alert('📎 Seleciona um ficheiro PDF primeiro.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result.split(',')[1];
    const blocoTam = 50000;
    const blocos = [];

    for (let i = 0; i < base64.length; i += blocoTam) {
      blocos.push(base64.slice(i, i + blocoTam));
    }

    // Mostrar blocos no ecrã
    const container = document.getElementById('blocosContainer');
    container.innerHTML = '';
    blocos.forEach((bloco, index) => {
      const div = document.createElement('div');
      div.className = 'bloco';
      div.innerHTML = `<b>Bloco ${index + 1}</b><br><textarea readonly>${bloco}</textarea>`;
      container.appendChild(div);
    });

    // Enviar para o Google Sheets
    enviarBlocosParaSheets(blocos);
  };

  reader.readAsDataURL(file);
}

// Limpa tudo
function limparBlocos() {
  document.getElementById('blocosContainer').innerHTML = '';
  document.getElementById('mensagemEnvio').textContent = '';
  document.getElementById('pdfInput').value = '';
}

// Envia os blocos para o Google Sheets
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
    const linhas = response.result.updates.updatedRows || blocos.length;
    msgDiv.textContent = `✅ Enviados ${linhas} blocos para o Google Sheets!`;
    msgDiv.style.color = 'green';
    console.log('Resposta do Sheets:', response);
  }).catch(err => {
    msgDiv.textContent = '❌ Erro ao enviar para o Google Sheets.';
    msgDiv.style.color = 'red';
    console.error('Erro no envio para Sheets:', err);
  });
}