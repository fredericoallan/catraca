//minhas bibliotecas
var http                = require(`http`);
var url                 = require('url');
var request             = require('request');
var request             = request.defaults({ jar: true });

//arquivos de configuracoes e funcoes
var validaParametros    = require('./validaParametros'); 


/*

funcao para logar no rest do ahgora
@parametros de exemplo: 
{
"company": "a268783", -- id da softbox
"matricula": "100413",
"senha": "100413",
"mes": "07",
"ano": "2017"
}
"dia": será usado para buscar o ponto do dia

*/
function logarPonto(comp, mat, s, m, a, callback) {
    console.log('..loginPonto.logarPonto');
    request.post({
        url: 'https://www.ahgora.com.br/externo/getApuracao',
        body: {
            company: comp,
            matricula: mat,
            senha: s,
            mes: m,
            ano: a
        },
        headers: {
            'Content-Type': 'application/json'
        },
        json: true
    }, function(error, response, body) {
        if (error) {
            console.log('..[ERROR] Buscar login no ponto: ', error);
            return callback(error);
        }
        
        try {
            //o retorno nao trouxe nenhum dado, nem o nome do funcionário?
            if (body.error == 'empty_required_data' || body.error == 'not_found') {
                console.log('..[ALERTA] nenhum resultado com este usuario e senha: ', body.error);
                return callback(body.error);
            }else{
                //recuperar o nome do funcionario correto
                var funcionario = body.funcionario;
                
                //celular recebe uma string separada por virgula pra fazer split
                var retorno = funcionario;

                //retornar (nao tive erro, retornar o nome do funcionario)
                return callback(null, retorno);
            }

        } catch (err) {
            console.log('..[ERROR] Erro buscar o nome do funcionario: ', err);
            return callback(err, ret);
        }
    })
}

//INICIO DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------

module.exports.loginP = function loginP (req, res, jsonCorreto, callBackLogarP) {

    console.log('..loginPonto.loginP');

    var query = req.body;

    //validar se os parametros estao corretos passados na rota logarPonto
    validaParametros.validaParam(req, query, jsonCorreto, function(resJson) {

        if (JSON.parse(resJson).success == false) {
            console.log(resJson);
            return callBackLogarP(resJson);
        }

        logarPonto(query['company'], query['matricula'], query['senha'], query['mes'], query['ano'], function(err, ret) {
            if (err) {
                console.log(err);
                return callBackLogarP(JSON.stringify({'ret':err,'msg':'usuario ou senha invalidos', 'success':false}, null, '\t'));
            }else{
                console.log('..' + ret);
                return callBackLogarP(JSON.stringify({'usuario': ret, 'msg': 'Login realizado com sucesso', 'success': true}, null, '\t'));
                // return callBackLogarP(ret);
            }
        });
   }); 
};

//FIM DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------