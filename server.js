//minhas bibliotecas
var express         = require('express');
var app             = express();
var compression	    = require('compression');
var cors            = require('cors');
var bodyParser      = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

//arquivos de configuracoes e funcoes
var config          = require('./config.json');
var consulCatr      = require('./consultaCatraca');
var consulPont      = require('./consultaPonto');
var loginPont       = require('./loginPonto');
var jsonCorreto     = '';


//INICIO DO MAPEAMENTO DE ROTAS --------


/*
Rota para /loginPonto

Objetivo: 
Validar se os parametros estao corretos e utilizar um serviço rest do ahgora que retorna
os dados iniciais do colaborador, independente se tem batidas ou nao
utilizando o serviço https://www.ahgora.com.br/externo/getApuracao

Exemplo:
http://localhost:3003/loginPonto/?company=a268783&matricula=100413&senha=100413&mes=07&ano=2017

Parametros:
  @req          : parametros passados na url
  @res          : interacao com o browser nas respostas

Parametros:
  @company      : id que o agora cadastrou a softbox (hadcode)
  @matricula    : matricula que se loga no ahgora
  @senha        : senha que se loga no ahgora
  @mes          : mes que se deseja pesquisar o ponto
  @ano          : ano que se deseja pesquisar o ponto

*/
app.post('/loginPonto', function (req, res) {

  console.log('1)Acessando loginPonto');

  //jsonCorreto contendo os parametros que devem vir das requisições
  jsonCorreto = {'company':'','matricula':'','senha':'','mes':'','ano':''};

  //chamar o arquivo consultaPonto.js na função de export consultaC
  loginPont.loginP(req, res, jsonCorreto, function(retorno){
    return res.send(retorno);
  });
})



/*
Rota para /consultaPonto

Objetivo: 
Validar se os parametros estao corretos e utilizar um serviço rest do ahgora que retorna
os dados de batidas do dia (conforme data passada) do colaborador

Exemplo:
http://localhost:3003/consultaPonto/?company=a268783&matricula=100413&senha=100413&mes=07&ano=2017&dia=12

Parametros:
  @req          : parametros passados na url
  @res          : interacao com o browser nas respostas

Parametros:
  @company      : id que o agora cadastrou a softbox (hadcode)
  @matricula    : matricula que se loga no ahgora
  @senha        : senha que se loga no ahgora
  @mes          : mes que se deseja pesquisar o ponto
  @ano          : ano que se deseja pesquisar o ponto
  @dia          : dia que se deseja pesquisar o ponto



*/
app.post('/consultaPonto', function (req, res) {

  console.log('2)Acessando consultaPonto');

  //jsonCorreto contendo os parametros que devem vir das requisições
  jsonCorreto = {'company':'','matricula':'','senha':'','mes':'','ano':'', 'dia':''};

  //chamar o arquivo consultaPonto.js na função de export consultaC
  consulPont.consultaP(req, res, jsonCorreto, function(retorno){
    return res.send(retorno);
  });
})



/*
Rota para /consultaCatraca

Objetivo: 
Validar se os parametros estao corretos e fazer uma requisicao no ahgora para capturar os
dados de catraca do colaborador. retornar em formato de json o resultado da consulta.

Exemplo:
http://localhost:3003/consultaCatraca/?resu=fredericosouza@softbox.com.br&ssap=soft@123&omret=Frederico Allan de Souza&atd=05/06/2017

Parametros:
  @req          : parametros passados na url
  @res          : interacao com o browser nas respostas

Parametros:
  @resu         : usuario para logar no ahgora modo consulta catraca (permissao restrita)
  @ssap         : senha
  @omret        : nome completo do colaborador cadastrado no ahgora
  @atd          : data de consulta da catraca

*/
app.post('/consultaCatraca', function (req, res) {

  console.log('3)Acessando consultaCatraca');

  //jsonCorreto contendo os parametros que devem vir das requisições
  jsonCorreto = {'resu':'','ssap':'','omret':'','atd':''};

  //chamar o arquivo consultaCatraca.js na função de export consultaCatraca
  consulCatr.consultaC(req, res, jsonCorreto, function(retorno){
    return res.send(retorno);
  });

})



/*
Rota para / ou qualquer outra rota que não exista
EX: localhost:3003/
EX: localhost:3003/asd

Objetivo: 
responder vazio para qualquer rota que for diferente de /consultaPonto e /consultaCatraca
Esta função precisa ficar abaixo das funcões acima. Desta forma ele executa a função abaixo se as 
acima não foram requisitadas

Parametros:
  @req          : parametros passados na url
  @res          : interacao com o browser nas respostas
*/
app.get('*', function (req, res) {
  console.log('4)O IP [' + req.ip + '] tentou acessar a rota desconhecida: [' + req.params + ']');
  return res.send(JSON.stringify({'msg':'rota desconhecida','success':false}, null, '\t'));
})

//FIM DO MAPEAMENTO DE ROTAS --------


//CRIAÇÃO DO LISTENER ---------------

var server = app.listen(config.porta, config.bindIP, function () {

    //variaveis do server
    var host = server.address().address;
    var port = server.address().port;

    //comprimir dados trafegados
    app.use(compression());

    //habilitar trust para que funcione req.ip: capturar ips que estao acessando
    app.enable('trust proxy');

    //console de start do servidor node
    console.log('............................');
    console.log('Sistema\t\t:Consulta Catraca Ahgora');
    console.log('Versão\t\t:' + config.versao);
    console.log('Copyright\t:' +  config.ano);
    console.log('Autor\t\t:' + config.autor);
    console.log('Servidor\t:http://' + config.dns + ':' + port);
    console.log('............................');
})
