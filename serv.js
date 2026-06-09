const ADMIN_PASSWORD = "8718";
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = new sqlite3.Database("psc1.db");

db.run(`
CREATE TABLE IF NOT EXISTS inscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    email TEXT,
    telephone TEXT,
    dateNaissance TEXT,
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
        dateNaissance,
        message
    } = req.body;

    db.run(
        `INSERT INTO inscriptions
        (nom, prenom, email, telephone, dateNaissance, message)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            nom,
            prenom,
            email,
            telephone,
            dateNaissance,
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
                <th>Actions</th>
            </tr>
            `;

            rows.forEach(row => {

                html += `
                <tr>
                    <td>${row.nom}</td>
                    <td>${row.prenom}</td>
                    <td>${row.email}</td>
                    <td>${row.telephone}</td>
                    <td>${row.dateNaissance}</td>
                    <td>${row.message}</td>
                    <td>${row.message}</td>
                    <td>
                        <a href="/edit/${row.id}">Modifier</a>
                        |
                        <a href="/delete/${row.id}" onclick="return confirm('Supprimer cet inscrit ?')">Supprimer</a>
                    </td>
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
app.get("/delete/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM inscriptions WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                return res.send("Erreur lors de la suppression");
            }

            res.redirect("/admin");

        }
    );

});

app.get("/edit/:id", (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT * FROM inscriptions WHERE id = ?",
        [id],
        (err, row) => {

            if (err || !row) {
                return res.send("Inscription introuvable");
            }

            res.send(`
            <html>
            <body style="font-family:Arial;padding:30px">

            <h1>Modifier l'inscription</h1>

            <form method="POST" action="/edit/${row.id}">

            <input name="nom" value="${row.nom}" placeholder="Nom"><br><br>

            <input name="prenom" value="${row.prenom}" placeholder="Prénom"><br><br>

            <input name="email" value="${row.email}" placeholder="Email"><br><br>

            <input name="telephone" value="${row.telephone}" placeholder="Téléphone"><br><br>

            <input type="date" name="dateNaissance" value="${row.dateNaissance}"><br><br>

            <textarea name="message" rows="5">${row.message || ""}</textarea><br><br>

            <button type="submit">
            Enregistrer
            </button>

            </form>

            <br>

            <a href="/admin">
            Retour à la liste
            </a>

            </body>
            </html>
            `);

        }
    );

});

app.post("/edit/:id", (req, res) => {

    const id = req.params.id;

    const {
        nom,
        prenom,
        email,
        telephone,
        dateNaissance,
        message
    } = req.body;

    db.run(
        `UPDATE inscriptions
        SET
        nom = ?,
        prenom = ?,
        email = ?,
        telephone = ?,
        dateNaissance = ?,
        message = ?
        WHERE id = ?`,
        [
            nom,
            prenom,
            email,
            telephone,
            dateNaissance,
            message,
            id
        ],
        (err) => {

            if (err) {
                return res.send("Erreur lors de la modification");
            }

            res.redirect("/admin");

        }
    );

});
const path = require("path");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pse1.html"));
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
