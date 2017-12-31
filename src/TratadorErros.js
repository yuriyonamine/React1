import PubSub from 'pubsub-js';

export default class TratadorErros {
    publicaErros(erros){
        if(erros.errors){
            for (var i=0;i<erros.errors.length;i++){
                var erro = erros.errors[i];
                PubSub.publish("erro-validacao",erro);
            }
        }
    }
}