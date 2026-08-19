const confirma = document.getElementById("confirmar");
const cancela = document.getElementById("cancelar");

let eventoAtual = "";
let nome = "";


confirma.addEventListener("click", function(){
    eventoAtual = "";
    nome = prompt("Para confirmar, digite seu nome:"); 
})

cancela.addEventListener('click', function(){
    eventoAtual = "";
    nome = prompt("Para cancelar, digite seu nome:")
})

if(eventoAtual === confirma){
    alert("Presença confirmada");
}

