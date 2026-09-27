import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const app = express();

app.use(express.json());
app.use(express.static("."));

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


pool.connect()
    .then(client => {

        console.log("Conectado com sucesso ao PostgreSQL!");

        client.release();

    })
    .catch(erro => {

        console.error(
            "Erro ao conectar ao PostgreSQL:",
            erro
        );

    });


app.post("/api/convidados/buscar", async (req, res) => {

    const { nome } = req.body;

    if (!nome) {

        return res.status(400).json({
            encontrado: false,
            mensagem: "Nome não informado."
        });

    }


    try {

        const resultado = await pool.query(
            `
            SELECT id, nome, confirmado
            FROM convidados
            WHERE LOWER(TRIM(nome)) = LOWER(TRIM($1))
            LIMIT 1
            `,
            [nome]
        );


        if (resultado.rows.length === 0) {

            return res.json({
                encontrado: false
            });

        }


        const convidado = resultado.rows[0];


        res.json({

            encontrado: true,

            id: convidado.id,

            nome: convidado.nome,

            confirmado: convidado.confirmado

        });


    } catch (erro) {

        console.error(
            "Erro ao buscar convidado:",
            erro
        );


        res.status(500).json({

            encontrado: false,

            mensagem: "Erro ao consultar o banco de dados."

        });

    }

});


app.post("/api/convidados/confirmar", async (req, res) => {

    const { id } = req.body;


    if (!id) {

        return res.status(400).json({

            sucesso: false,

            mensagem: "ID do convidado não informado."

        });

    }


    try {

        const resultado = await pool.query(
            `
            UPDATE convidados
            SET confirmado = TRUE,
                confirmado_em = NOW()
            WHERE id = $1
            `,
            [id]
        );


        if (resultado.rowCount === 0) {

            return res.status(404).json({

                sucesso: false,

                mensagem: "Convidado não encontrado."

            });

        }


        console.log(
            `Presença confirmada - ID: ${id}`
        );


        res.json({

            sucesso: true

        });


    } catch (erro) {

        console.error(
            "Erro ao confirmar presença:",
            erro
        );


        res.status(500).json({

            sucesso: false,

            mensagem: "Erro ao salvar confirmação."

        });

    }

});


app.post("/api/convidados/cancelar", async (req, res) => {

    const { id } = req.body;


    if (!id) {

        return res.status(400).json({

            sucesso: false,

            mensagem: "ID do convidado não informado."

        });

    }


    try {

        const resultado = await pool.query(
            `
            UPDATE convidados
            SET confirmado = FALSE,
                confirmado_em = NULL
            WHERE id = $1
            `,
            [id]
        );


        if (resultado.rowCount === 0) {

            return res.status(404).json({

                sucesso: false,

                mensagem: "Convidado não encontrado."

            });

        }


        console.log(
            `Presença cancelada - ID: ${id}`
        );


        res.json({

            sucesso: true

        });


    } catch (erro) {

        console.error(
            "Erro ao cancelar presença:",
            erro
        );


        res.status(500).json({

            sucesso: false,

            mensagem: "Erro ao cancelar confirmação."

        });

    }

});


app.listen(3000, () => {

    console.log(
        "Servidor rodando em http://localhost:3000"
    );

});