import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
    res.redirect("/index.html");
});
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(client => {
        console.log("Conectado com sucesso ao Supabase!");
        client.release();
    })
    .catch(erro => {
        console.error("Erro ao conectar ao Supabase:", erro.message);
    });

app.post("/api/convidados/confirmar", async (req, res) => {
    const nome = typeof req.body.nome === "string"
        ? req.body.nome.trim().replace(/\s+/g, " ")
        : "";

    if (!nome || nome.length > 150 || nome.split(" ").length < 2) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Digite seu nome e sobrenome corretamente."
        });
    }

    try {
        const resultado = await pool.query(
            `INSERT INTO public.convidados
                (nome, confirmado, confirmado_em)
             VALUES ($1, TRUE, NOW())
             ON CONFLICT (
                (LOWER(REGEXP_REPLACE(TRIM(nome), '[[:space:]]+', ' ', 'g')))
             )
             DO UPDATE SET
                confirmado = TRUE,
                confirmado_em = CASE
                    WHEN public.convidados.confirmado = TRUE
                        THEN public.convidados.confirmado_em
                    ELSE NOW()
                END
             RETURNING id, nome, confirmado`,
            [nome]
        );

        const convidado = resultado.rows[0];

        console.log(`Confirmação processada - ID: ${convidado.id}`);

        return res.json({
            sucesso: true,
            mensagem: `Presença confirmada com sucesso, ${convidado.nome}!`
        });

    } catch (erro) {
        console.error("Erro ao confirmar presença:", erro.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Não foi possível salvar a confirmação. Tente novamente."
        });
    }
});

app.post("/api/convidados/cancelar", async (req, res) => {
    const nome = typeof req.body.nome === "string"
        ? req.body.nome.trim().replace(/\s+/g, " ")
        : "";

    if (!nome || nome.length > 150 || nome.split(" ").length < 2) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Digite seu nome e sobrenome corretamente."
        });
    }

    try {
        const resultado = await pool.query(
            `UPDATE public.convidados
             SET confirmado = FALSE,
                 confirmado_em = NOW()
             WHERE LOWER(REGEXP_REPLACE(TRIM(nome), '[[:space:]]+', ' ', 'g'))
                 = LOWER(REGEXP_REPLACE(TRIM($1), '[[:space:]]+', ' ', 'g'))
               AND confirmado = TRUE
             RETURNING id, nome`,
            [nome]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Não encontramos uma confirmação ativa com esse nome."
            });
        }

        const convidado = resultado.rows[0];

        console.log(`Presença cancelada - ID: ${convidado.id}`);

        return res.json({
            sucesso: true,
            mensagem: `Presença cancelada com sucesso, ${convidado.nome}.`
        });

    } catch (erro) {
        console.error("Erro ao cancelar presença:", erro.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Não foi possível cancelar a presença. Tente novamente."
        });
    }
});

app.get("/api/presentes", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT id, nome
            FROM public.presentes
            WHERE reservado = FALSE
            ORDER BY nome ASC
        `);

        res.json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao listar presentes:", erro.message);
        res.status(500).json({
            mensagem: "Não foi possível carregar os presentes."
        });
    }
});

app.post("/api/presentes/:id/reservar", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            mensagem: "Presente inválido."
        });
    }

    try {
        const resultado = await pool.query(`
            UPDATE public.presentes
            SET reservado = TRUE,
                reservado_em = NOW()
            WHERE id = $1
              AND reservado = FALSE
            RETURNING id, nome
        `, [id]);

        if (resultado.rowCount === 0) {
            return res.status(409).json({
                mensagem: "Esse presente já foi escolhido por outra pessoa."
            });
        }

        res.json({
            sucesso: true,
            mensagem: "Obrigado! Seu presente foi confirmado.",
            presente: resultado.rows[0]
        });
    } catch (erro) {
        console.error("Erro ao reservar presente:", erro.message);
        res.status(500).json({
            mensagem: "Não foi possível confirmar o presente."
        });
    }
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

export default app;