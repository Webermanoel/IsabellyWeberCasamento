const confirma = document.getElementById("confirmar");
const cancela = document.getElementById("cancelar");

let eventoAtual = "";
let nome = "";


async function validarConvidado() {

    if (!nome) {
        return;
    }

    try {

        const resposta = await fetch("/api/convidados/buscar", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome: nome.trim()
            })

        });


        const dados = await resposta.json();


        if (!dados.encontrado) {

            alert("Nome não encontrado na lista de convidados.");

            return;
        }


        if (eventoAtual === "confirmar") {

            const confirmar = await fetch(
                "/api/convidados/confirmar",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        id: dados.id
                    })

                }
            );


            const resultado = await confirmar.json();


            if (resultado.sucesso) {

                alert(
                    `Presença confirmada para: ${dados.nome}`
                );

            } else {

                alert(
                    resultado.mensagem ||
                    "Não foi possível confirmar a presença."
                );

            }

        }


        else if (eventoAtual === "cancelar") {

            const cancelar = await fetch(
                "/api/convidados/cancelar",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        id: dados.id
                    })

                }
            );


            const resultado = await cancelar.json();


            if (resultado.sucesso) {

                alert(
                    `Presença cancelada para: ${dados.nome}`
                );

            } else {

                alert(
                    resultado.mensagem ||
                    "Não foi possível cancelar a presença."
                );

            }

        }

    } catch (erro) {

        console.error("Erro:", erro);

        alert(
            "Erro ao conectar com o servidor."
        );

    }
}

confirma.addEventListener("click", function () {

    eventoAtual = "confirmar";

    nome = prompt(
        "Para confirmar, digite seu nome e sobrenome:"
    );

    validarConvidado();

});


cancela.addEventListener("click", function () {

    eventoAtual = "cancelar";

    nome = prompt(
        "Para cancelar, digite seu nome e sobrenome:"
    );

    validarConvidado();

});