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
function buscarPonto(comp, mat, s, m, a, d, callback) {
    console.log('..consultaPonto.buscarPonto');
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
            console.log('..[ERROR] Buscar relatorio ponto: ', error);
            return callback(error);
        }
        
        try {
            //o retorno nao trouxe nenhum dado, nem o nome do funcionário?
            if (body.error == 'empty_required_data' || body.error == 'not_found') {
                console.log('..[ALERTA] nenhum resultado com estes parametros: ', body.error);
                return callback(body.error);
            }else{
                //recuperar o nome do funcionario correto
                var funcionario = body.funcionario.nome;
                //se o body retornou valores
                if (body.length != 0){
                    //capturar o json dos dados do dia escolhido
                    var diaPonto = body.dias[a + '-' + m + '-' + d];
                    var batidasDia = '';
                    var hora = '';
                    //existem batidas?
                    if (diaPonto.batidas.length > 0){
                        //fazer um for pra pegar os dados das batidas e retornar da forma que ja fiz no app, formatando a hora como 00:00
                        for (i in diaPonto.batidas) {
                            hora = diaPonto.batidas[i].hora;
                            var horaFormatada = (hora.trim() != '' && hora !=undefined) ? (hora.substring(0, 2) + ':' + hora.substring(4, 2)) : hora;
                            batidasDia = batidasDia + '|' + horaFormatada;
                        }

                        //inserir o ultimo |
                        batidasDia = batidasDia + '|';
                        var horaTrabalhada =  '';
                        var horaExpediente = '';
                        var horaAtraso = '';
                        var horaExtra = '';

                        //capturar hora extra com a função de retornar valor caso nao tenha condiçoes invalidas
                        if(diaPonto.resultado.length > 0){
                            for(i in diaPonto.resultado){
                                switch(diaPonto.resultado[i].tipo) {
                                    case 'Horas Trabalhadas':
                                        horaTrabalhada = (diaPonto.resultado[i].valor.trim() != '' && diaPonto.resultado[i].valor !=undefined) ? (diaPonto.resultado[i].valor.substring(0, 2) + ':' + diaPonto.resultado[i].valor.substring(4, 2)) : diaPonto.resultado[i].valor;
                                        break;
                                    case 'Expediente':
                                        horaExpediente = (diaPonto.resultado[i].valor.trim() != '' && diaPonto.resultado[i].valor !=undefined) ? (diaPonto.resultado[i].valor.substring(0, 2) + ':' + diaPonto.resultado[i].valor.substring(4, 2)) : diaPonto.resultado[i].valor;
                                        break;
                                    case 'ATRASO':
                                        horaAtraso = (diaPonto.resultado[i].valor.trim() != '' && diaPonto.resultado[i].valor !=undefined) ? (diaPonto.resultado[i].valor.substring(0, 3) + ':' + diaPonto.resultado[i].valor.substring(4, 2)) : diaPonto.resultado[i].valor;
                                        break;
                                    case 'Extra':
                                        horaExtra = (diaPonto.resultado[i].valor.trim() != '' && diaPonto.resultado[i].valor !=undefined) ? (diaPonto.resultado[i].valor.substring(0, 2) + ':' + diaPonto.resultado[i].valor.substring(4, 2)) : diaPonto.resultado[i].valor;
                                        break;
                                }
                            }
                        }
                        //celular recebe uma string separada por virgula pra fazer split
                        var retorno = funcionario + ';' + batidasDia + ';' +  horaExtra + ';' +  horaAtraso;

                        //retornar (nao tive erro, array com os valores)
                        return callback(null, retorno);
                    }else {
                        //celular recebe uma string separada por virgula pra fazer split somente com o nome do funcionario
                        var retorno = funcionario + ';' + ';' + ';';
                        console.log('..[ALERTA] nenhuma batida encontrada para: ' + funcionario);
                        //retornar (nao tive erro, array vazio)
                        return callback(null, retorno);
                    }
                }
            }

        } catch (err) {
            console.log('..[ERROR] Erro ao converter a resposta ou sem dados de ponto: ', err);
            return callback(err, null);
        }
    })
}

//INICIO DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------

module.exports.consultaP = function consultaP (req, res, jsonCorreto, callBackConsultaP) {

    console.log('..consultaPonto.consultaP');

    // var query = url.parse(req.url,true).query;
    var query = req.body;

    //validar se os parametros estao corretos passados na rota consultaPonto
    validaParametros.validaParam(req, query, jsonCorreto, function(resJson) {

        if (JSON.parse(resJson).success == false) {
            console.log(resJson);
            return callBackConsultaP(resJson);
        }
        console.log('consultando ponto', query)
        buscarPonto(query['company'], query['matricula'], query['senha'], query['mes'], query['ano'], query['dia'], function(err, ret) {
            if (err) {
                console.log(err);
                return callBackConsultaP(JSON.stringify({'ret':err,'success':false}, null, '\t'));
            }else{
                console.log(ret);
                return callBackConsultaP(JSON.stringify(ret, null, '\t'));
            }
        });
   }); 
};

//FIM DA FUNCAO QUE SERA EXECUTADA NA ROTA   --------