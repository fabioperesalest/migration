# Migration code plug-and-play

### Como usar esse código e suas funções?

Primeiramente crie um novo repositório onde será feita a nova migração, lembrando de manter o padrão de nomenclatura que seguimos na Alest: <br>
`(produto/plataforma-tipodeprojeto-internoOuExterno-cliente)` <br>
ex: `clm-migration-external-nomedocliente`

Após criar o repositório copie o link do novo repositório e siga para o próximo passo

Caso esteja utilizando Linux ou MacOS:
Execute o comando: `npm run setup-unix`

Caso esteja utilizando Windows:
Execute o comando: `npm run setup-win`

No terminal será solicitado que insira o link do repositório da nova migração, apenas cole o link e pressione ENTER.

Ao final da execução, as dependencias do projeto devem estar instaladas e sua estrutura de pastas deve estar dessa forma:

```
--|config
--|src
  --|logs
  --|Files
  --|modules
    --|auth
    --|process
    --|services
    --|utils
    --|validation
.env.example
.gitignore
default-sheet.xlsx
index.js
package-lock.json
package.json
README.md
```

A pasta Files está definida no `.gitignore` para não ser commitada para o github, pois ela é a pasta que irá conter todos os documentos a serem migrados (normalmente são pastas muito pesadas), então crie manualmente essa pasta dentro de src.

Caso você tenha inserido algum caractere invalido no momento de colar o link do novo repositório, execute o seguinte comando no terminal:

`git remote add origin <url-do-novo-repositorio>`.

Com as configurações feitas, agora basta ler a documentação para entender como o script está estruturado e como você pode utiliza-lo.

## Enviroments Variables

```javascript
TOKEN_MAKE = "seu token de api da make";
ENDPOINT_INSTANCE = "endpoint da api da docusign: uatna11 || na11";
ACCOUNT_ID = "account id da docusign";
PROJECT_NAME = "nome do projeto no gcp";
SECRET_NAME = "nome da secret";
URI_PATH_CLM = "caminho da pasta de destino do clm";
FATHER_FOLDER_ID = "id da pasta que vai receber os documentos no CLM";
```

## Files

Dentro da pasta Files deverão conter seus documentos, o código está estruturado para percorrer pastas no seguinte formato:

```
--|src
    --|Files
      --|Pasta1
        --|subPasta1
          --|documento.pdf
          --|documento.docx
          --|documento.pdf
        --|subPasta2
          --|documento.pdf
          --|documento.docx
          --|documento.pdf
      --|Pasta2
        --|subPasta1
            --|documento.pdf
            --|documento.docx
            --|documento.pdf
        --|subPasta2
            --|documento.pdf
            --|documento.docx
            --|documento.pdf


```

## Auth

Dentro de `auth` temos funções de autenticação, para pegarmos alguma secret do gcp (caso exista alguma na migração em questão) ou para pegarmos access token do data store da make.

```javascript
getSecretGcp();
//Pega o valor da secret no GCP (normalmente algum token ou informação sigilosa que você precise armazenar).

getAccessToken();
// Pega o access token no data store da make

// As váriaveis de ambiente desse arquivo são:
TOKEN_MAKE = "";
```

## Process

Em process existem as funções de processamento de arquivos, sendo elas:

```javascript
base64EncodeStream();
// É utilizada dentro das funções de process, para ler os arquivos de forma páginada e também utiliza Node Streams para ler esses documentos de forma que não haja vazamento de memória ou consumo excessivo de recursos.

processUnitaryFiles();
// Processa os arquivos de forma unitária, essa função é mais indicada quando a migração precisa que os documentos tenham atributos no CLM.

processFullFolder();
// Processa todos os arquivos de uma pasta e realiza tratamentos de retry caso alguma das requisições de upload falhe, é recomendado utilizar essa função apenas se a migração não precisa inserir metadados em documentos no CLM.

// As váriaveis de ambiente desse arquivo são:
FATHER_FOLDER_ID = "";
ACCOUNT_ID = "";
```

## Services

Em services temos as funções responsavéis por manipular grande parte das requisições de API utilizada nas migrações de documentos:

```javascript
createFolderAtCLM();
// Realiza a criação de uma pasta no CLM utilizando o mesmo nome da pasta que foi lida no diretório local (já possui as validações necessárias para erros no status code ou para pastas que já existem no CLM).

getFolderByPath();
// Função auxiliar da createFolderAtCLM(); essa função é responsavel por antes de tentarmos criar uma pasta no CLM realizarmos a pesquisa para ver se ela já existe no CLM, caso exista essa função apenas vai retornar o ID dessa pasta para que possamos upar o documento na função uploadDocuments(); e caso não exista ela segue o fluxo da função createFolderAtCLM();.

uploadDocuments();
// Responsável por realizar o upload dos documentos (os documentos estarão em base64 independente da extensão deles, seja .pdf, .docx, .cfb ...) e no final retorna também o ID do documento no CLM.

updateAttributes();
// Realiza o update dos atributos do documento que acabou de ser enviado ao CLM, fazendo com que seja possivel realizarmos a pesquisa avançada por atributos no CLM.

// As váriaveis de ambiente desse arquivo são:
ENDPOINT_INSTANCE = "";
ACCOUNT_ID = "";
```

## Utils

Aqui temos as funções responsáveis por facilitar nossa vida, realizando leitura de planilhas e estrutando isso em um json final que é compativel com outras funções, função para gerar logs e etc.

```javascript
logs();
// Função utilizada em varias outras funções para gerar logs em um arquivo local, para termos total ciência de quais arquivos foram processados, quais deram erro e etc.

readSheet();
// Essa é a função responsável por auxilar nas migrações com atributos.
// Ela realiza a leitura de uma planilha local e estrutura essas informações em um JSON para que seja possivel utilizar esses dados para montar o caminho do arquivo no diretório local e também para que possamos estruturar o JSON com os atributos a serem atualizados no CLM após o upload do documento.

paginateArray();
// Função simples para páginar um array na quantidade que você desejar ou sentir necessidade.

addExtensionToArchive();
// Pode ser util em alguma migração que envolva o PROJURIS ou quando houver uma grande volumetria de documentos sem extensão. O CLM só permite a visualização de PDF e DOCX se o documento que foi enviado possuir claramente essa extensão no final do nome, por exemplo: documentoteste.pdf.
// Essa função possui diversas validações para identificar o tipo de arquivo, lendo metadados, contéudo e etc. Ao final da execução você deverá possuir todos os arquivos já com a extensão.

removeExtesion();
// Caso tenha feito alguma coisa de errado nos documentos ao adicionar as extensões ou caso queira remover as extensões de todos os arquivos, essa função irá tirar a extensão do arquivo, deixando apenas o nome dele: documentoteste.pdf => documentoteste.

detectFileType();
// O detectFileType é utilizado dentro de outras funções que estão relacionadas a renomear os arquivos, ela retorna um objeto com o tipo do arquivo e algumas outras informações.

addExtensionToNotes();
// O intuito dessa função é ajudar no levantamento de quais tipos de extensão os arquivos da migração atual possuem, ele adiciona todas as extensões em um arquivo txt.

setAttributesAtDocument();
// retorna um objeto no formato que a API do CLM espera receber para realizar o upload dos atributos no CLM.

readFiles();
// realiza a leitura do diretório de pastas por completo e no final retorna um array de objetos contendo: {pasta: 'nome da pasta', arquivos: []}
// na chave arquivos o valor é um array contendo o nome de todos os arquivos que aquela pasta possui.

createSheetWithPaths();
// Cria uma planilha com o caminho ja correto das pastas que estão no diretório local, a planilha fica pronta para ser encaminhada para o cliente faltando apenas estilizar no padrão que desejar.
// Essa função utiliza a default-sheet.xlsx que já vem vazia no repositório para criar, então não existe a necessidade de criar um novo arquivo ou subir uma nova planilha em branco.
```

## Validation

Possui funções de validações simples:

```javascript
matchFolders();
// Verifica se o conteúdo da planilha (as colunas que possuem os dados necessários para montar o caminho do diretório local) estão de acordo com o diretório local. Pode ser util quando o cliente fica responsável por nos enviar a planilha completa.

formatStr();
//Formata uma string removendo alguns caracteres pré-definidos (olhe a documentação da função para remover os caracteres), também remove espaços em branco no inicio e no final da string.
```

## Funções auto-invocadas (IIFE - Immediately Invoked Function Expression)

Para facilitar o start no código no arquivo index.js existes algumas IIFE já predefinidas com algumas ações que você pode estar buscando:

Upload unitario já com os atributos (utilizando a planilha)
```javascript
 (async () => {
   try {
     const token = await getAccessToken("client-name-on-make-data-store");
     const sheetRows = readSheet("base-with-attributes-and-path.xlsx", maxColumns, maxRows, numPage);
     for (let i = 0; i < sheetRows.length; i++) {
       const mainDirectory = sheetRows[i].pasta;
       const directory = sheetRows[i].subpasta;
       const doc = sheetRows[i].arquivo;
       // Para mudar o nome dos attributos acesse diretamente o json da função setAttributesAtDocument na pasta Modules
       const attributes = await setAttributesAtDocument(sheetRows[i]);
      
         await appendFile("line.txt", `Linha da planilha N°: ${i}\n`);
         await processUnitaryFiles(
           mainDirectory,
           directory,
           token,
           doc,
           attributes
         );
     }
   } catch (error) {
     console.error(error);
   }
 })();
```
<hr>

Upload em massa sem atributos (utilizando apenas a estrutura local de pastas)
```javascript
 (async () => {
   const token = await getAccessToken("client-name-on-make-data-store");
   await processFullFolder(mainDirectory, directory, token);
 })();
```
<hr>

Ações com os documentos (adicionar extensão, remover, etc).
```javascript 
 (async () => {
   const dataDocument = await readFiles(mainDirectory, directory);
// Adicionar extensão nos arquivos (adiciona em todos os arquivos)
   await addExtensionToArchive(
     dataDocument,
     mainDirectory,
     directory,
     500,
     10000
   );

// remover extensão dos arquivos (remove de todos os arquivos)
   await removeExtesion(
     dataDocument,
     mainDirectory,
     directory,
     extensionsToRemove
   );
 })();
```
<hr>




## Documentação auxiliar interna

Além do README.md bem estruturado e detalhado, todas as funções foram documentadas manualmente utilizando o padrão do JSDOC, então caso alguma dúvida não tenha sido sanada aqui no README fique a vontade para consultar os arquivos onde as funções estão, pois lá você irá encontrar documentações complementares sobre o código em questão.
