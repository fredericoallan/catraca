//minhas bibliotecas
    var http                = require(`http`);
    var url                 = require('url');
    var request             = require('request');
    var request             = request.defaults({ jar: true });

/*

Funcao que valida os parametros passados na rota

*/
function validaParametros (req, res, query, callBackConsulta) {

    console.log('..loginPonto.validaParametros');

    //verificar se passou todos os parametros necessários (usuario, senha, termo, dta)
    //@company      : id que o agora cadastrou a softbox (hadcode)
    //@matricula    : matricula que se loga no ahgora
    //@senha        : senha que se loga no ahgora
    //@mes          : mes que se deseja pesquisar o ponto
    //@ano          : ano que se deseja pesquisar o ponto
    //Exemplo       : http://localhost:3003/loginPonto/?company=a268783&matricula=100413&senha=100413&mes=07&ano=2017
    //https://www.w3schools.com/tags/ref_urlencode.asp

    var jsonCorreto = {'company':'','matricula':'','senha':'','mes':'','ano':''};

    //passou parametros vazios?
    if (req.query === {}) {
        console.log('..Parametros invalidos');
        return callBackConsulta(JSON.stringify({'msg':'Parametros Invalidos','parametros':query,'success':false}));  
    }

    //validar se os nomes dos parametros estao corretos
    //Object.keys(jsonCorreto) transforma objeto  'jsonCorreto' em uma matriz
    //depois pego o resultado da matriz e uso a funcao de filtrar 'filter'
    //a funcao filter tem uma funcao de callback que retorna varios parametros (uma chave, e a posicao)
    //uso a chave e posicao pra validar se o valor de query[chave] existe!
    const chavesIguais = Object.keys(jsonCorreto).filter(function (chave, ps) {
        return query[chave] != undefined
    });

    //passou 6 parametros pelo menos?
    if (chavesIguais.length != 5) {
        console.log('..Parametros incorretos');
        return callBackConsulta(JSON.stringify({'msg':'Parametros com qtd e ordem incorretos','parametros':query,'esperado':jsonCorreto,'success':false}));
    }

    //se existe parametro correto (passou no if acima) mas estao vazios
    //Object.keys(query) transforma objeto  'query' em uma matriz
    //depois pego o resultado da matriz e uso a funcao de filtrar 'filter'
    //a funcao filter tem uma funcao de callback que retorna varios parametros (uma chave, e a posicao)
    //uso a chave e posicao pra validar se o valor de query[chave] existe!
    const valoresVazios = Object.keys(query).filter(function (chave, ps) {
        return query[chave] == undefined || query[chave] == null || query[chave].trim() == ''
    });
    
    //os parametros não sao vazios?
    //no retorno acima, filter retorna um array em valoresVazios que são diferentes de vazio
    //obrigatoriamente deve retornar 6 valores
    if (valoresVazios.length > 0) {
        console.log('..Alguns parametros vazios');
        return callBackConsulta(JSON.stringify({'msg':'Alguns parametros vazios','parametros':valoresVazios,'success':false}));
    }
    
    //passou mes no formato correto?
    //uso de regex para validar se data esta no formato correto
    //mes é o 4 paramentro com chave mes. ou seja, query['mes']
    //ao realizar o replace, valido se encontrou a correspondencia do regex 're'
    //se nao retornou, esta no formato errado
    var re = /1[0-2]|0[1-9]/;
    const validaMes = query['mes'].toString().replace(re, '');
    if (validaMes != '') {
        console.log('..Mes sem o formato mm');
        return callBackConsulta(JSON.stringify({'msg':'Mes sem o formato mm','parametros':query['mes'],'success':false}));
    }

    //passou ano no formato correto?
    //uso de regex para validar se data esta no formato correto
    //ano é o 5 paramentro com chave ano. ou seja, query['ano']
    //ao realizar o replace, valido se encontrou a correspondencia do regex 're'
    //se nao retornou, esta no formato errado
    var re = /[2-9][0-9]{3}/;
    const validaAno = query['ano'].toString().replace(re, '');
    if (validaAno != '') {
        console.log('..Ano sem o formato yyyy');
        return callBackConsulta(JSON.stringify({'msg':'Ano sem o formato yyyy','parametros':query['ano'],'success':false}));
    }

    //caso nao tenha retornado nenhum erro nos ifs acima, executa os comandos abaixo
    console.log('..:Parametros Corretos');
    return callBackConsulta(JSON.stringify({'msg':'Parametros Corretos','parametros':query,'success':true}));
}

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
                var funcionario = body.funcionario.nome;
                
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

module.exports.loginP = function loginP (req, res, callBackLogarP) {

    console.log('..loginPonto.loginP');

    var query = url.parse(req.url,true).query;

    //validar se os parametros estao corretos passados na rota logarPonto
    validaParametros(req, res, query, function(resJson){

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
                //return callBackLogarP(JSON.stringify(ret, null, '\t'));
                return callBackLogarP(ret);
            }
        });
   }); 
};

//FIM DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------