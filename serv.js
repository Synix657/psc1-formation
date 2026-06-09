const ADMIN_PASSWORD = "8718";
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database("psc1.db");

db.run(`
CREATE TABLE IF NOT EXISTS inscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    email TEXT,
    telephone TEXT,
    dateFormation TEXT,
    message TEXT,
    dateInscription DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

app.post("/inscription", (req, res) => {

    const {
        nom,
        prenom,
        email,
        telephone,
        dateFormation,
        message
    } = req.body;

    db.run(
        `INSERT INTO inscriptions
        (nom, prenom, email, telephone, dateFormation, message)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            nom,
            prenom,
            email,
            telephone,
            dateFormation,
            message
        ],
        (err) => {

            if(err){
                return res.status(500)
                .send("Erreur lors de l'enregistrement");
            }

            res.send(
                "Votre inscription a bien été enregistrée."
            );

        }
    );

});
app.get("/admin", (req, res) => {

    db.all(
        "SELECT * FROM inscriptions ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.send("Erreur");
            }

            let html = `
            <html>
            <head>
            <title>Inscrits PSC1</title>

            <style>

            body{
                font-family:Arial;
                padding:30px;
                background:#f4f4f4;
            }

            table{
                width:100%;
                border-collapse:collapse;
                background:white;
            }

            th{
                background:#004080;
                color:white;
            }

            th,td{
                border:1px solid #ddd;
                padding:10px;
            }

            </style>

            </head>

            <body>

            <h1>Liste des inscrits</h1>

            <table>

            <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Date</th>
                <th>Message</th>
            </tr>
            `;

            rows.forEach(row => {

                html += `
                <tr>
                    <td>${row.nom}</td>
                    <td>${row.prenom}</td>
                    <td>${row.email}</td>
                    <td>${row.telephone}</td>
                    <td>${row.dateFormation}</td>
                    <td>${row.message}</td>
                </tr>
                `;

            });

            html += `
            </table>
            </body>
            </html>
            `;

            res.send(html);

        }
    );

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
