const CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'SUA_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = 'ID_DA_SUA_PLANILHA';

// Inicializar a API Google e autenticação
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
    // Verifica se está autenticado
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      gapi.auth2.getAuthInstance().signIn();
    }
  });
}

// Função para enviar blocos para a planilha (cada bloco numa linha)
function enviarBlocosParaSheets(blocos) {
  const values = blocos.map(bloco => [bloco]); // Cada bloco em uma linha (coluna A)

  const body = {
    values: values
  };

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1', // onde começar
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: body,
  }).then(response => {
    console.log(`${response.result.updates.updatedRows} linhas inseridas.`);
    alert('Blocos enviados para Google Sheets com sucesso!');
  }, error => {
    console.error(error);
    alert('Erro ao enviar para Google Sheets');
  });
}
