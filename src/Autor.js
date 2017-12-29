import React, {Component} from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';
import SubmitButton from './components/SubmitButton';
import CustomizedInput from './components/CustomizedInput';

class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = {nome:'', email:'', senha:''};
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    setNome(evento) {
       this.setState({nome: evento.target.value});
    }
    
    setEmail(evento) {
       this.setState({email: evento.target.value});
    }
    
    setSenha(evento) {
       this.setState({senha: evento.target.value});
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
          url: 'http://localhost:8080/api/autores',
          contentType: 'application/json',
          type: 'post',
          dataType: 'json',
          data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
          success: function(resposta) {
            PubSub.publish('lista-atualiza-autores', resposta);
            this.setState({nome:'', email:'', senha:''});
          }.bind(this),
          error: function(resposta) {
              if(resposta.status == 400){
                new TratadorErros().publicaErros(resposta.responseJSON);
              }
          },
          beforeSend: function(){
              PubSub.publish("limpa-erros", {});
          }
        });
    }
    
    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" method="post" onSubmit={this.enviaForm}>
                  <CustomizedInput id="nome" name="nome" label="Nome" type="text" value={this.state.nome} onChange={this.setNome}/>
                  <CustomizedInput id="email" name="email" label="Email" type="email" value={this.state.email} onChange={this.setEmail}/>
                  <CustomizedInput id="senha" name="senha" label="Senha" type="password" value={this.state.senha} onChange={this.setSenha}/>              
                  <SubmitButton label="Enviar"/>
                </form>             
            </div>                
        );
    }
}

class TabelaAutores extends Component {    
    render() {
        return (
            <div>            
            <table className="pure-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                        this.props.lista.map(function(autor) {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>                
                                    <td>{autor.email}</td>                
                            </tr>
                       );  
                    })
                }
                  </tbody>
                </table>
             </div>
        );
    }
}   

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = {lista: []};
    }
    
    componentDidMount() {
        $.ajax({
          url:"http://localhost:8080/api/autores",
          dataType:"json",
          success: function(resposta, error){
            this.setState({lista:resposta});
          }.bind(this)
        });

        PubSub.subscribe('lista-atualiza-autores', function(topico, novaLista){
            this.setState({lista: novaLista});
        }.bind(this));
    }

    render() {
        return (
        <div>
            <div className="header">
              <h1>Cadastro de autores</h1>
            </div>
            <div className="content" id="content">                            
                <FormularioAutor/>
                <TabelaAutores lista={this.state.lista}/>        
            </div>      
        </div>
        );
    }
}