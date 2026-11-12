
const formularioCha = document.getElementById("form-cha-panela");
const campoNomeCha = document.getElementById("nome-cha-panela");
const mensagemCha = document.getElementById("mensagem-cha-panela");
const botaoCha = document.getElementById("confirmar-cha-panela");

formularioCha.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = campoNomeCha.value.trim().replace(/\s+/g, " ");

    mensagemCha.textContent = "";
    mensagemCha.className = "";

    if (!nome || nome.split(" ").length < 2) {
        mensagemCha.textContent = "Digite seu nome e sobrenome.";
        mensagemCha.className = "erro";
        return;
    }

    botaoCha.disabled = true;
    botaoCha.innerHTML = "<span>Enviando...</span>";

    try {
        const resposta = await fetch("/api/cha-panela/confirmar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome })
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            throw new Error(
                dados.mensagem || "Não foi possível confirmar sua presença."
            );
        }

        mensagemCha.textContent = dados.mensagem;
        mensagemCha.className = "sucesso";

        formularioCha.reset();

    } catch (erro) {
        console.error("Erro na confirmação do chá:", erro);

        mensagemCha.textContent =
            erro.message || "Não foi possível salvar sua confirmação. Tente novamente.";

        mensagemCha.className = "erro";

    } finally {
        botaoCha.disabled = false;
        botaoCha.innerHTML =
            "<span>Confirmar presença</span><span aria-hidden='true'>♡</span>";
    }
});
