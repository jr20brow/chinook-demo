const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./Chinook_Sqlite.sqlite");
const app = express();
app.use(express.json());
// Test route: list all tables in the database
app.get('/tables', (req, res) => {
    const stmt = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    res.json(stmt.all());
});

app.get('/artists', (req, res) => {
    const stmt = db.prepare(
        "SELECT * FROM artist"
    );
    res.json(stmt.all());
});

app.get("/artists/:id/albums", (req, res) => {
    const stmt = db.prepare(`
SELECT *
FROM Album
WHERE Album.ArtistId = ?
`);
    const albums = stmt.all(req.params.id);
    if (albums.length === 0) {
        return res.status(404).json({ error: "No albums found" });
    }
    res.json(albums);
});

app.get("/albums", (req, res) => {
    const stmt = db.prepare(`
SELECT *
FROM Album
`);
    res.json(stmt.all());
});

app.get("/tracks", (req, res) => {
    const stmt = db.prepare(`
SELECT *
FROM Track
`);
    res.json(stmt.all());
});

app.get("/tracks/long", (req, res) => {
    const stmt = db.prepare(`
SELECT Album.title, Track.name, Track.milliseconds
FROM Album
JOIN Track ON Album.AlbumId = Track.AlbumId
WHERE Track.milliseconds > 300000
`);
    res.json(stmt.all());
});



app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});