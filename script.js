window.onload = function() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
      checkbox.checked = false;
    });
    nome = document.getElementById('nomeSala')
    nome.value = ''
  };

var socket = io();

socket.on('connect', () =>{
    console.log(`Conectado no Server`)
})



function resetar(informacaoUsuario){
    cabeca = document.getElementById(`${informacaoUsuario.cabeca}-cabeca`)
    cabeca.style.display = "none"
    corpo = document.getElementById(`${informacaoUsuario.corpo}-corpo`)
    corpo.style.display = "none"
    pe = document.getElementById(`${informacaoUsuario.pe}-pe`)
    pe.style.display = "none"
    acessorioFrente = document.getElementById(`${informacaoUsuario.acessorio_frente}`)
    acessorioFrente.style.display = "none"
    acessorioTras = document.getElementById(`${informacaoUsuario.acessorio_tras}`)
    acessorioTras.style.display = "none"
    texto = document.getElementById('placar')
    texto.innerText = ''
    back = document.getElementById('animacao_placar');
    back.style.display = 'none'
}

socket.on('reset', (userInfo)=>{
    resetar(userInfo);
})

socket.on('Voltar', (mensagem)=>{
    voltarElementos();
    resetar(mensagem); 

})

function voltarElementos(){
    config = document.getElementsByClassName('configSala')
    config[0].style.display = 'none'
    home = document.getElementsByClassName('salas')
    home[0].style.display = 'block'
    carta = document.getElementsByClassName('carta')
    carta[0].style.display = 'none'
    botao = document.getElementById('criarSala')
    botao.style.display = 'block'
    texto = document.getElementById('placar')
    texto.innerText = ''
    back = document.getElementById('animacao_placar');
    back.style.display = 'none'
}

function enviarEscolha(atributo){
    socket.emit('valorEnviado', atributo)
}

function voltar(){
    // let queroVoltar = "Estou voltando pra ficar"
    // socket.emit('sairSala')
    location.reload()
}

// socket.on('Calculado', (value)=>{
//     console.log(value)
// })

function animacao_placar(value, placar){
    placarHtml =document.getElementById('placar')
    placarHtml.innerText = `EU: ${placar[0]} OPONENTE: ${placar[1]}`
    texto = document.getElementById('mensagem')
    texto.innerText = value
    back = document.getElementById('animacao_placar');
    jogo = document.getElementById('jogo');
    jogo.style.display = 'none';
    back.style.display = 'inline-block'
    if(value == 'ganhou'){
        back.style.backgroundColor = 'green'
        texto.classList.add("animacao_ganhou");
        setTimeout(()=>{texto.classList.remove("animacao_ganhou");}, 8000)
        

    } else {
        back.style.backgroundColor = 'red'
        texto.classList.add("animacao_perdeu");
        setTimeout(()=>{texto.classList.remove("animacao_perdeu");}, 200000)
        
        
    }
    console.log(texto)
}

socket.on('ganhou', (placar)=>{
    // console.log('ganhou');
    animacao_placar('ganhou', placar);


})

socket.on('perdeu', (placar)=>{
    // console.log('perdeu')
    animacao_placar('perdeu', placar);
    setTimeout(()=>{
        location.reload();
    }, 3000)
})

socket.on('reload', ()=>{
    location.reload();
})

socket.on('salasD', (salasD) => {
    location.reload
    salasDisponiveis = document.getElementsByClassName('salasDisponiveis')[0];
    let salas = ""
    
    for(let chave in salasD){
        // console.log(salasD[chave].numeroJogadoresAtual == salasD[chave].numeroJogadoresMaximo ? 'disabled' : '')
        salas += `
        <div class="sala" id="${salasD[chave].idSala}">
            <p">${salasD[chave].nomeSala} <b>${salasD[chave].numeroJogadoresAtual}/${salasD[chave].numeroJogadoresMaximo}</b> </p>
            <button ${salasD[chave].numeroJogadoresAtual == salasD[chave].numeroJogadoresMaximo ? 'disabled' : ''} onclick="entrarSalaCriada(this.id)" class="EntrarSala" id="${salasD[chave].idSala}">Entrar Sala</button>
        </div>
        `
    }
    salasDisponiveis.innerHTML = salas
    if(salas == ``){
        salasDisponiveis.style = ``
    } else {
        salasDisponiveis.style = `
        background: linear-gradient(135deg, #F25258, #F39563);
        padding: 20px;
        border-radius: 10px;
        border-top: 1px solid #F25258;
        border-left: 1px solid #F25258;
        border-bottom: 1px solid #F39563;
        border-right: 1px solid #F39563;
        /* box-shadow: 20px 20px 80px #f3956377;
        box-shadow: -20px -20px 80px #f2525745; */
        box-shadow: 20px 20px 40px #f3956377, -20px -20px 40px #f2525745;
        `
    }


})



function entrarSalaCriada(idSala){
    socket.emit('entrarSala', idSala);
    console.log(`Entrei na sala ${idSala}`)

    home = document.getElementsByClassName('salas')
    home[0].style.display = 'none'
    carta = document.getElementsByClassName('carta')
    carta[0].style.display = 'block'
    carta[0].classList.add("cairTexto");


    // socket.on('user_info', (userInfo)=>{
    //     back = document.getElementById('animacao_placar');
    //     back.style.display = 'none'
    //     jogo = document.getElementById('jogo');
    //     jogo.style.display = 'block';

    //     // console.log(userInfo);
    //     let informacaoUsuario = userInfo
    //     cabeca = document.getElementById(`${informacaoUsuario.cabeca}-cabeca`)
    //     cabeca.style.display = "block"
    //     corpo = document.getElementById(`${informacaoUsuario.corpo}-corpo`)
    //     corpo.style.display = "block"
    //     pe = document.getElementById(`${informacaoUsuario.pe}-pe`)
    //     pe.style.display = "block"
    //     acessorioFrente = document.getElementById(`${informacaoUsuario.acessorio_frente}`)
    //     acessorioFrente.style.display = "block"
    //     acessorioTras = document.getElementById(`${informacaoUsuario.acessorio_tras}`)
    //     acessorioTras.style.display = "block"

    //     valor_inteligencia = document.getElementById("valor_inteligencia")
    //     valor_inteligencia.innerText = `${informacaoUsuario.inteligencia}`
    //     valor_forca = document.getElementById("valor_forca")
    //     valor_forca.innerText = `${informacaoUsuario.forca}`
    //     valor_velocidade = document.getElementById("valor_velocidade")
    //     valor_velocidade.innerText = `${informacaoUsuario.velocidade}`
    // });



}

function configSala(){
    botao = document.getElementById('criarSala')
    botao.style.display = 'none'
    config = document.getElementsByClassName('configSala')
    config[0].style.display = 'block'

    const checkboxes = document.querySelectorAll('.nJogadores');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Desativa os outros checkboxes
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                        limite = this.name
                    }
                });
            } else {
                // Reativa os outros checkboxes
                checkboxes.forEach(otherCheckbox => {
                    otherCheckbox.checked = false;
                });
            }
        });
    });


}

socket.on('user_info', (userInfo)=>{
    back = document.getElementById('animacao_placar');
    back.style.display = 'none'
    jogo = document.getElementById('jogo');
    jogo.style.display = 'block';

    // console.log(userInfo);
    let informacaoUsuario = userInfo
    cabeca = document.getElementById(`${informacaoUsuario.cabeca}-cabeca`)
    cabeca.style.display = "block"
    corpo = document.getElementById(`${informacaoUsuario.corpo}-corpo`)
    corpo.style.display = "block"
    pe = document.getElementById(`${informacaoUsuario.pe}-pe`)
    pe.style.display = "block"
    acessorioFrente = document.getElementById(`${informacaoUsuario.acessorio_frente}`)
    acessorioFrente.style.display = "block"
    acessorioTras = document.getElementById(`${informacaoUsuario.acessorio_tras}`)
    acessorioTras.style.display = "block"

    valor_inteligencia = document.getElementById("valor_inteligencia")
    valor_inteligencia.innerText = `${informacaoUsuario.inteligencia}`
    valor_forca = document.getElementById("valor_forca")
    valor_forca.innerText = `${informacaoUsuario.forca}`
    valor_velocidade = document.getElementById("valor_velocidade")
    valor_velocidade.innerText = `${informacaoUsuario.velocidade}`
});




function criarSala(){
    nome = document.getElementById('nomeSala')
    nomeSala = nome.value;
    let checkboxApertado = false;
    const checkboxes = document.querySelectorAll('.nJogadores');
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            checkboxApertado = true;
        }
    });
    console.log(checkboxApertado);
    console.log(nomeSala)
    if(checkboxApertado && (nomeSala != ``)){
        home = document.getElementsByClassName('salas')
        home[0].style.display = 'none'
        carta = document.getElementsByClassName('carta')
        carta[0].style.display = 'block'
    
        let infoTemp = {limite: limite, nomeSala: nomeSala}
    
        socket.emit('salaCriada', infoTemp);
    } else {
        alert('Marque o número de pessoas na sala e preencha o nome da sala');
    }
}








var limite;
var nomeSala;










// Array de montagem 
// primeira posição Cabeça jacaré, capivara, passaro, sapo
// segunda posição corpo jacaré, capivara, passaro, sapo
// terceira posição pé jacaré, capivara, passaro, sapo
// let partes = ["jacare", "capivara", "passaro", "sapo"]
// let acessoriosFrente = [];
// for(let i = 1; i < 10; i++){
//     acessoriosFrente.push(`acessorio_frente_${i}`)
// }
// let acessoriosTras = [];
// for(let i = 1; i < 6; i++){
//     acessoriosTras.push(`acessorio_tras_${i}`)
// }


// let informacaoUsuario = {
//     cabeca: partes[Math.floor(Math.random()*4)],
//     corpo: partes[Math.floor(Math.random()*4)],
//     pe: partes[Math.floor(Math.random()*4)],
//     acessorio_frente: acessoriosFrente[Math.floor(Math.random()*9)],
//     acessorio_tras: acessoriosTras[Math.floor(Math.random()*5)]
// }

