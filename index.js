const express = require('express');
const app = express();
const http = require('http');
const { userInfo } = require('os');
const server = http.createServer(app);

// Sockets
const { Server } = require('socket.io');
const io = new Server(server);


// Rotas
app.use("/public", express.static("public", {}))
app.use(express.static(__dirname));
// app.use("/Site")
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Site/index.html');
});


// Variáveis de sorteio
let partes = ["jacare", "capivara", "passaro", "sapo"]
let acessoriosFrente = [];
for(let i = 1; i < 10; i++){
    acessoriosFrente.push(`acessorio_frente_${i}`);
}
let acessoriosTras = [];
for(let i = 1; i < 6; i++){
    acessoriosTras.push(`acessorio_tras_${i}`);
}

// Definição da pontuação

let pontuacoesCabeca = [40, 30, 20, 10];
let pontuacoesCorpo = [10, 20, 30, 40];
let pontuacoesPe = [20, 10, 40, 30];


// Inicio dos usuários

var cartasUsers = {};

function gerarCarta(id, idSala){
    let cabeca = Math.floor(Math.random()*4);
    let corpo = Math.floor(Math.random()*4);
    let pe = Math.floor(Math.random()*4);
    let acessorio_frente = Math.floor(Math.random()*9);
    let acessorio_tras = Math.floor(Math.random()*5);
    let pontuacaoInteligencia = pontuacoesCabeca[cabeca] + (acessorio_frente+1)*3 + (acessorio_tras+1)*3;
    let pontuacaoForca = pontuacoesCorpo[corpo] + (acessorio_frente+1)*5 + (acessorio_tras+1)*5;
    let pontuacaoVelocidade = pontuacoesPe[pe] + (acessorio_frente+1)**2 + (acessorio_tras+1)**2;
    cartasUsers[id] = {
      cabeca: partes[cabeca],
      corpo: partes[corpo],
      pe: partes[pe],
      acessorio_frente: acessoriosFrente[acessorio_frente],
      acessorio_tras: acessoriosTras[acessorio_tras],
      inteligencia: pontuacaoInteligencia,
      forca: pontuacaoForca,
      velocidade: pontuacaoVelocidade,
      sala: idSala,
      valoresEscolhidos: 0
    }
    return cartasUsers[id]
  }

// Definido as salas
let salasD = {}

function gerarSala(id, limiteJogadores, nome){
    salasD[`sala:${id}`] = {
        idJogadores: [id],
        idSala: `sala:${id}`,
        numeroJogadoresMaximo: limiteJogadores,
        numeroJogadoresAtual: 1,
        valoresJogadores: [],
        jogadas: 0,
        nomeSala: nome
    }
}

function adicionarPlayerSala(id, salaId){
    salasD[salaId].idJogadores.push(id);
    salasD[salaId].numeroJogadoresAtual += 1;
}

function removerPlayerSala(id, salaId){
    salasD[salaId].idJogadores.splice(salasD[salaId].idJogadores.indexOf(id), 1);
    salasD[salaId].numeroJogadoresAtual -= 1;
}

function atualizarSalas(){
    io.emit('salasD', salasD);
}

function reset(id){


    if(Object.keys(salasD).length){
        atualizarSalas();
    }
    if(cartasUsers[id]){
        const chave = cartasUsers[id].sala;
        removerPlayerSala(id, cartasUsers[id].sala);
            if(salasD[chave].numeroJogadoresAtual > 0){
                let mensagem = 'Alguém saiu'
                voltar(id);
                atualizarSalas();
            }
            if(salasD[chave].numeroJogadoresAtual == 0){
                let mensagem = 'A sala foi fechada'
                voltar(id);
                delete salasD[chave]
                atualizarSalas();
            }
    }
}
    

function voltar(id){
    io.to(id).emit('Voltar', cartasUsers[id]);
}



// Iniciar conexão via socket

io.on('connection', (socket) => {

    if(Object.keys(salasD).length){
        atualizarSalas();
    }

    console.log(`Usuário ${socket.id}: conectado`);

    // Criando uma sala
    socket.on('salaCriada', (config)=>{
        gerarSala(socket.id, config.limite, config.nomeSala);
        atualizarSalas();

        // Gerando info de usuário
        var userInfo = gerarCarta(socket.id, `sala:${socket.id}`);
        // Enviar a info para o usuário
        socket.emit('user_info', userInfo)
    });




    // Entrar em sala criada
    socket.on('entrarSala', (idSala)=>{
        socket.join(idSala);
        adicionarPlayerSala(socket.id, idSala);
        atualizarSalas();

        // Gerando info de usuário
        var userInfo = gerarCarta(socket.id, idSala);
        // Enviar a info para o usuário
        socket.emit('user_info', userInfo);
      })


      socket.on('valorEnviado', (atributo)=>{

        let vencedores = [];
        let perdedores = [];
        let salaAtual = cartasUsers[socket.id].sala;
        salasD[salaAtual].jogadas += 1;
        salasD[salaAtual].valoresJogadores.push([`${socket.id}`, cartasUsers[socket.id][atributo]]);
        if(salasD[salaAtual].jogadas == salasD[salaAtual].numeroJogadoresMaximo){
            let listaDeJogadores = salasD[salaAtual].valoresJogadores;
            let batalhas = [];
            for(let i = 0; i < listaDeJogadores.length; i+=2){
                batalhas.push([listaDeJogadores[i], listaDeJogadores[i+1]]);
            }
            for(let batalha of batalhas){
                if(batalha[0][1] > batalha[1][1]){
                    io.to(batalha[0][0]).emit('ganhou', [batalha[0][1], batalha[1][1]]);
                    io.to(batalha[1][0]).emit('perdeu', [batalha[1][1], batalha[0][1]]);
                    vencedores.push(batalha[0][0]);
                    perdedores.push(batalha[1][0]);

                } else if(batalha[0][1] < batalha[1][1]){
                    io.to(batalha[1][0]).emit('ganhou', [batalha[1][1], batalha[0][1]]);
                    io.to(batalha[0][0]).emit('perdeu', [batalha[0][1], batalha[1][1]]);
                    vencedores.push(batalha[1][0]);
                    perdedores.push(batalha[0][0]);
                } else {
                    io.to(batalha[0][0]).emit('empatou');
                    io.to(batalha[1][0]).emit('empatou');
                }
            }
            
            for(let pessoa of vencedores){
                // io.to(pessoa).emit('ganhou');
                setTimeout(()=>{
                    let numeroJogadores = salasD[salaAtual].numeroJogadoresAtual
                    salasD[salaAtual].jogadas = 0;
                    salasD[salaAtual].numeroJogadoresMaximo = vencedores.length
                    if(numeroJogadores > 1){
                        io.to(pessoa).emit('reset', cartasUsers[pessoa])
                        // salasD[cartasUsers[pessoa].sala].numeroJogadoresAtual = vencedores.length
                        salasD[salaAtual].valoresJogadores = [];
                        // var sala = cartasUsers[pessoa].sala
                        var userInfo = gerarCarta(pessoa, cartasUsers[pessoa].sala);
                        // Enviar a info para o usuário
                        io.to(pessoa).emit('user_info', userInfo);
                    } else if(numeroJogadores == 1){
                        io.to(pessoa).emit('reload');
                    }
                }, 3000);
            }
            for(let pessoaP of perdedores){
                // io.to(pessoaP).emit('perdeu', cartasUsers[pessoaP].valoresEscolhidos);
                // setTimeout(()=>{
                    // io.to(pessoa).emit('Voltar', cartasUsers[pessoa]);
                // }, 3000)
            }
            // salasD[salaAtual].numeroJogadoresAtual = vencedores.length;
        }
        
      })

      socket.on('disconnect', () => {
        console.log(`Usuário ${socket.id}: desconectado`)
        reset(socket.id);
        delete cartasUsers[socket.id];
      })
    
});




// Start do server
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });




