import React, {Component} from 'react';
import CustomizedInput from './components/CustomizedInput';
import SubmitButton from './components/SubmitButton'
import $ from 'jquery';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';    

class TabelaLivros extends Component {
    
    render() {
        return (
            <div>            
            <table className="pure-table">
                  <thead>
                    <tr>
                      <th>Titulo</th>
                      <th>Preço</th>
                      <th>Autor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                        this.props.livros.map(function(livro) {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>                
                                    <td>{livro.preco}</td>                
                                    <td>{livro.autor.nome}</td>                
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

class FormularioLivro extends Component {
    constructor() {
        super();
        this.state={titulo:'', preco:''};        
        this.enviaForm = this.enviaForm.bind(this);
    }

    salvaAlteracao(nomeInput, evento){
        var campoSendoAlterado = {};
        campoSendoAlterado[nomeInput] = evento.target.value;    
        this.setState(campoSendoAlterado);   
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: "http://localhost:8080/api/livros",
            contentType: "application/json",
            dataType: "json",
            method:"post",
            data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
            success: function(result) {
                PubSub.publish("atualiza-lista-livros", result);                
                this.setState({titulo:'',preco:'',autorId:''});
            }.bind(this),
            error: function(resposta) {
                if(resposta.status == 400){
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function(){
                PubSub.publish("limpa-erros",{});
            }  
            });
        this.setState({titulo: '', preco: '', autorId: ''});
    }

    render() {
        return (
            <div className="autorForm">
                <form className="pure-form pure-form-aligned" url="http://localhost:8080/api/livros" method="post" onSubmit={this.enviaForm}>
                    <CustomizedInput id="titulo" name="titulo" type="text" label="Titulo" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this, 'titulo')}/>
                    <CustomizedInput id="preco" name="preco" type="text" label="Preco" value={this.state.preco} onChange={this.salvaAlteracao.bind(this, 'preco')}/>
                    <div className="pure-control-group">
                        <label>Autores</label>
                        <select value={this.state.autorId} name="autorId" onChange={this.salvaAlteracao.bind(this, 'autorId')}>
                            <option value=""></option>
                            {
                                this.props.autores.map(function(autor){
                                    return (<option value={autor.id} key={autor.id} >{autor.nome}</option>);
                                })
                            }                        
                        </select>
                    </div>
                    <SubmitButton label="Registrar Livro"/>                    
                </form>
            </div>
        );
    }
}

export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = {livros: [], autores:[]};
    }

    componentDidMount() {
        PubSub.subscribe("atualiza-lista-livros", function(topico, novaLista){
            this.setState({livros: novaLista});
        }.bind(this));

        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: "json",
            method: "get",
            success: function(result){
                this.setState({"autores": result});
            }.bind(this),
            error: (function(result) {
                console.log(result);
            })
        });

        $.ajax({
            url: "http://localhost:8080/api/livros",
            dataType: "json",
            method: "get",
            success: function(result) {
                this.setState({"livros": result});
            }.bind(this),                  
        });
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">       
                    <FormularioLivro autores={this.state.autores}/>                     
                    <TabelaLivros livros={this.state.livros}/>                    
                </div>      
            </div>
        );
    }
}