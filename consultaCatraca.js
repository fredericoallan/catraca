//minhas bibliotecas

    var http                = require(`http`);
    var url                 = require('url');
    var request             = require('request');
    var request             = request.defaults({ jar: true });
    var jar                 = request.jar();

/*

Funcao que valida os parametros passados na rota

*/
function validaParametros (req, res, query, callBackConsulta) {

    console.log('..consultaCatraca.validaParametros');

    //verificar se passou todos os parametros necessários (usuario, senha, termo, dta)
    //@resu     : usuario do agora
    //@ssap     : senha do agora
    //@omret    : nome completo do usuario
    //@atd      : data de consulta da catraca
    //Exemplo   : http://localhost:3003/consultaCatraca/?resu=fredericosouza@softbox.com.br&ssap=soft@123&omret=Frederico Allan de Souza&atd=05/06/2017
    //https://www.w3schools.com/tags/ref_urlencode.asp

    var jsonCorreto = {'resu':'','ssap':'','omret':'','atd':''};

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

    //passou 4 parametros pelo menos?
    if (chavesIguais.length != 4) {
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
    //obrigatoriamente deve retornar 4 valores
    if (valoresVazios.length > 0) {
        console.log('..Alguns parametros vazios');
        return callBackConsulta(JSON.stringify({'msg':'Alguns parametros vazios','parametros':valoresVazios,'success':false}));
    }
    
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

    //caso nao tenha retornado nenhum erro nos ifs acima, executa os comandos abaixo
    console.log('..Parametros corretos na consulta catraca');
    return callBackConsulta(JSON.stringify({'msg':'Parametros Corretos','parametros':query,'success':true}));
}

/*

funcao para logar no ahgora

*/
function logar(usuario, senha, callback) {
    console.log('..consultaCatraca.logar');
    console.log('..Realizando login Ahgora ', usuario);
    request.post({
        url: 'https://www.ahgora.com.br/usuario/login',
        form: {
            func: 'valida',
            usr: usuario,
            senha: senha,
            manterlogado: 'S' 
        },
        headers: {
            'User-Agent': 'request'
        },
        jar: jar
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            return callback(error);
        }else{
            console.log('..Login no sistema Ahgora realizado com sucesso.');
            return callback(null);
        }

    });
}


/*

funcao para recuperar o relatório de catraca
o parametro callback é uma funcao pra ser utilizada nas chamadas buscarRelCatraca
callback retorna error ou null e pode ser usado para outras funcoes
callback retorna tambem a resposta captura da pagina (ret). neste caso parser do html com dados das catracas

*/
function buscarRelCatraca(termo, data, callback) {
    console.log('..Consultando acessos de ', termo, ' em ',  data);
    var url = "https://www.ahgora.com.br/acessos/monta_tabela_diaria_data?sEcho=3&iColumns=9&sColumns=%2C%2C%2C%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=30&mDataProp_0=0&sSearch_0=&bRegex_0=false&bSearchable_0=false&bSortable_0=false&mDataProp_1=1&sSearch_1=&bRegex_1=false&bSearchable_1=false&bSortable_1=true&mDataProp_2=2&sSearch_2=&bRegex_2=false&bSearchable_2=false&bSortable_2=true&mDataProp_3=3&sSearch_3=&bRegex_3=false&bSearchable_3=false&bSortable_3=true&mDataProp_4=4&sSearch_4=&bRegex_4=false&bSearchable_4=false&bSortable_4=true&mDataProp_5=5&sSearch_5=&bRegex_5=false&bSearchable_5=false&bSortable_5=true&mDataProp_6=6&sSearch_6=&bRegex_6=false&bSearchable_6=false&bSortable_6=true&mDataProp_7=7&sSearch_7=&bRegex_7=false&bSearchable_7=false&bSortable_7=true&mDataProp_8=8&sSearch_8=&bRegex_8=false&bSearchable_8=false&bSortable_8=true&sSearch=" + termo + "&bRegex=false&iSortCol_0=4&sSortDir_0=desc&iSortingCols=1&situacao=&data_inicial=" + data + "&data_final=" + data + "&empresa=&documento_pessoa=&localizacao=&localizacao_rep=&centro_custo=&_=1478370309301";

    //console.log(url);
    //a funcao get possui os parametros:
    //obj: json com dados get {url:,jar...}
    //funcao de callback com o retorno (erro, resposta, um html)
    //esta resposta foi utilizada na function (error,response,body)
    request.get({
        url: url,
        jar: jar
    }, function(error, response, body) {
        if (error) {
            console.log('..[ERROR] Buscar relatorio catraca: ', error);
            return callback(error);
        }
        
        try {
            var ret = JSON.parse(body);

            if (ret && ret['aaData'] && ret['aaData'] != undefined && ret['aaData'].length > 0) {
                ret = ret['aaData'].map(function(ele) {
                    return {
                        'catraca': ele[2],
                        'sentido': ele[3],
                        'horario': ele[4].substr(ele[4].length - 6, 2) + ':' + ele[4].substr(ele[4].length - 4, 2),
                        'data': ele[4]
                    };
                }).reverse();
            } else {
                ret = [];
            }

            //console.log(ret);

            return callback(null, ret);

        } catch (err) {
            console.log('..[ERROR] Erro ao converter a resposta ou sem dados de catraca: ', body);
            return callback(err, ret);
        }
    })
}

//INICIO DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------

module.exports.consultaC = function consultaC (req, res, callBackConsultaC) {

    console.log('..consultaCatrata.consultaC');

    var query = url.parse(req.url,true).query;

    //validar se os parametros estao corretos passados na rota consultaCatrata
    validaParametros(req, res, query, function(resJson){

        if (JSON.parse(resJson).success == false) {
            console.log(resJson);
            return callBackConsultaC(resJson);
        }

        //logar e logo apos , caso nao tenha err buscarRelCatraca
        logar(query['resu'], query['ssap'], function(err) {
            if (err) {
                console.log(err.message);
                return callBackConsultaC(JSON.stringify({'ret':err.message,'success':false}, null, '\t'));
            }
            //buscarRelCatraca caso nao tenha erro acima
            buscarRelCatraca(query['omret'], query['atd'], function(err, ret) {
                if (err) {
                    console.log(err.message);
                    return callBackConsultaC(JSON.stringify({'ret':err.message,'success':false}, null, '\t'));
                }else{
                    console.log(ret);
                    return callBackConsultaC(JSON.stringify(ret, null, '\t'));
                }
            });
        }); 
   }); 
};

//FIM DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------