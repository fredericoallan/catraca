//minhas bibliotecas
//  N/A

/*
Funcao que valida os parametros passados na rota
parametros:
  @req              : id que o agora cadastrou a softbox (hadcode)
  @query            : matricula que se loga no ahgora
  @jsonCorreto      : json contendo as chaves corretas que devem ser validadas em qtd, formato e tamanho
  @callBackConsulta : retorno de sucesso ou falha das validações
*/
module.exports.validaParam = function validaParam (req, query, jsonCorreto, callBackConsulta) {

    console.log('..validaParametros.validaParam');

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

    //passou qtd parametros conforme jsonCorreto?
    if (chavesIguais.length != Object.keys(jsonCorreto).length) {
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
    
    //se passou o parametro mes, validar o formato
    if (query['mes']) {
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
    }

    //se passou o parametro mes, validar o formato
    if (query['ano']) {
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
    }

    //se passou o parametro mes, validar o formato
    if (query['dia']) {
        //passou dia no formato correto?
        //uso de regex para validar se data esta no formato correto
        //dia é o 6 paramentro com chave dia. ou seja, query['dia']
        //ao realizar o replace, valido se encontrou a correspondencia do regex 're'
        //se nao retornou, esta no formato errado
        var re = /0[1-9]|[12]\d|3[01]/;
        const validaDia = query['dia'].toString().replace(re, '');
        if (validaDia != '') {
            console.log('..Dia sem o formato dd');
            return callBackConsulta(JSON.stringify({'msg':'Dia invalido ou sem o formato dd','parametros':query['dia'],'success':false}));
        }
    }

//se passou o parametro atd, validar o formato
if (query['atd']) {
    //passou data no formato correto?
    //uso de regex para validar se data esta no formato correto
    //data é o 4 paramentro com chave atd. ou seja, query['atd']
    //ao realizar o replace, valido se encontrou a correspondencia do regex 're'
    //se nao retornou, esta no formato errado
    var re = /(\d){2}\/(\d){2}\/(\d){4}/;
    const validaData = query['atd'].toString().replace(re, '');
    if (validaData != '') {
        console.log('..Data sem o formato dd/mm/yyyy');
        return callBackConsulta(JSON.stringify({'msg':'Data sem o formato dd/mm/yyyy','parametros':query['atd'],'success':false}));
    }
}
    //caso nao tenha retornado nenhum erro nos ifs acima, executa os comandos abaixo
    console.log('..Parametros Corretos');
    return callBackConsulta(JSON.stringify({'msg':'Parametros Corretos','parametros':query,'success':true}));
}