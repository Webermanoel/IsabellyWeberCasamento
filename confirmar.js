const confirma = document.getElementById("confirmar");
const cancela = document.getElementById("cancelar");

let eventoAtual = "";
let nome = "";

const listaConvidados = ["Leci Correa", "Iracema Alves Abel", "Wemersom Correa"];

function validarConvidado() {
    if (nome) {
        let nomeEncontrado = listaConvidados.find(
            n => n.toLowerCase() === nome.trim().toLowerCase()
        );

        if (nomeEncontrado) {
            if (eventoAtual === "confirmar") {
                alert(`Presença confirmada para: ${nomeEncontrado}`);
            } else if (eventoAtual === "cancelar") {
                alert(`Inscrição cancelada para: ${nomeEncontrado}`);
            }
        } else {
            alert("Nome não encontrado na lista de convidados.");
        }
    }
}

confirma.addEventListener("click", function() {
    eventoAtual = "confirmar";
    nome = prompt("Para confirmar, digite seu nome:"); 
    validarConvidado();
});

cancela.addEventListener('click', function() {
    eventoAtual = "cancelar";
    nome = prompt("Para cancelar, digite seu nome:");
    validarConvidado(); 
});
