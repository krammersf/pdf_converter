// Configurações da API Google
const CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';  // substitua pelo seu
const API_KEY = 'SUA_API_KEY';                                  // substitua pelo seu
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = 'ID_DA_SUA_PLANILHA';                    // substitua pelo seu

window.onload = () => {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
      document.getElementById('btnConverter').onclick = autenticarEConverter;
      document.getElementById('btnLimpar').onclick = limparBlocos;
    });
  });
};

function autenticarEConverter() {
  const msgDiv = document.getElementById('mensagemEnvio');
  msgDiv.textContent = '🔐 Verificando autenticação...';
  msgDiv.style.color = 'black';

  const authInstance = gapi.auth2.getAuthInstance();

  if (!authInstance.isSignedIn.get()) {
    authInstance.signIn().then(() => {
      msgDiv.textContent = '✅ Autenticado com sucesso!';
      msgDiv.style.color = 'green';
      converterPDFparaBase64();
    }).catch(err => {
      msgDiv.textContent = '❌ Erro ao autenticar. Veja o console.';
      msgDiv.style.color = 'red';
      console.error('Erro na autenticação:', err);
    });
  } else {
    msgDiv.textContent = '✅ Já autenticado!';
    msgDiv.style.color = 'green';
    converterPDFparaBase64();
  }
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
  document.getElementById('blocosConta
