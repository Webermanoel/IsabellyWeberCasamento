const confirma = document.getElementById("confirmar");
const cancela = document.getElementById("cancelar");
const campoNome = document.getElementById("nome");
const mensagem = document.getElementById("mensagem");

async function enviarAcao(acao) {
    const nome = campoNome.value.trim();

    mensagem.textContent = "";

    if (!nome) {
        mensagem.textContent = "Digite seu nome e sobrenome.";
        campoNome.focus();
        return;
    }

    if (nome.split(/\s+/).length < 2) {
        mensagem.textContent =
            "Por favor, digite seu nome e sobrenome.";
        campoNome.focus();
        return;
    }

    confirma.disabled = true;
    cancela.disabled = true;

    try {
        const resposta = await fetch(
            `/api/convidados/${acao}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nome })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            mensagem.textContent =
                resultado.mensagem ||
                "Não foi possível realizar a operação.";
            return;
        }

        mensagem.textContent = resultado.mensagem;

    } catch (erro) {
        console.error("Erro:", erro);

        mensagem.textContent =
            "Erro ao conectar com o servidor. Tente novamente.";
    } finally {
        confirma.disabled = false;
        cancela.disabled = false;
    }
}

confirma.addEventListener("click", () => {
    enviarAcao("confirmar");
});

cancela.addEventListener("click", () => {
    enviarAcao("cancelar");
});