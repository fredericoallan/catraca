//minhas bibliotecas
var express         = require('express');
var app             = express();
var compression	    = require('compression');


//arquivos de configuracoes e funcoes
var config          = require('./config.json');
var consulCatr      = require('./consultaCatraca');
var consulPont      = require('./consultaPonto');
var loginPont       = require('./loginPonto');


//INICIO DO MAPEAMENTO DE ROTAS --------


/*
Rota para /loginPonto
Objetivo: Validar se os parametros estao corretos e utilizar um serviço rest do ahgora que retorna
os dados iniciais do colaborador , independente se tem batidas ou nao
utilizando o serviço https://www.ahgora.com.br/externo/getApuracao
*/
app.get('/loginPonto', function (req, res) {
  
  console.log('1)Acessando loginPonto');

  //chamar o arquivo consultaPonto.js na função de export consultaC
  loginPont.loginP(req, res, function(retorno){
    return res.send(retorno);
  });
})

/*
Rota para /consultaPonto
Objetivo: Validar se os parametros estao corretos e utilizar um serviço rest do ahgora que retorna
os dados de batidas do dia (conforme data passada) do colaborador
*/
app.get('/consultaPonto', function (req, res) {
  
  console.log('2)Acessando consultaPonto');

  //chamar o arquivo consultaPonto.js na função de export consultaC
  consulPont.consultaP(req, res, function(retorno){
    return res.send(retorno);
  });
})

/*
Rota para /consultaCatraca
Objetivo: Validar se os parametros estao corretos e fazer uma requisicao no ahgora para capturar os
dados de catraca do colaborador. retornar em formato de json o resultado da consulta.
@paramentros:
  req: parametros passados na url:
  res: interacao com o browser nas respostas
*/
app.get('/consultaCatraca', function (req, res) {
  
  console.log('3)Acessando consultaCatraca');
  
  //chamar o arquivo consultaCatraca.js na função de export consultaCatraca
  consulCatr.consultaC(req, res, function(retorno){
    return res.send(retorno);
  });

})

/*
Rota para / ou qualquer outra rota que não exista
EX: localhost:3003/
EX: localhost:3003/asd
Objetivo: responder vazio para qualquer rota que for diferente de /consultaPonto e /consultaCatraca
Esta função precisa ficar abaixo das funcões acima. Desta forma ele executa a função abaixo se as 
acima não foram requisitadas
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
