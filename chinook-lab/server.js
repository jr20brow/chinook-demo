const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { resourceLimits } = require("node:worker_threads");
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

app.get("/genres", (req, res) => {
    const stmt = db.prepare(`
SELECT *
FROM Genre
`);
    res.json(stmt.all());
});

app.get("/playlist", (req, res) => {
    const stmt = db.prepare(`
SELECT *
FROM Playlist
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

app.get("/genres/:id/stats", (req, res) => {
    const stmt = db.prepare(`
SELECT Genre.name, COUNT(*) AS TrackCount, AVG(Track.Milliseconds) / 1000 AS LengthAverage 
FROM Track
JOIN Genre ON Track.GenreId = Genre.GenreId
WHERE Genre.GenreId = ?
`);
    const genres = stmt.all(req.params.id);
    if (genres.length === 0) {
        return res.status(404).json({ error: "No albums found" });
    }
    res.json(genres);
});

app.post("/playlist", (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "name is required" });
    }
    const stmt = db.prepare("INSERT INTO Playlist (Name) VALUES (?)");
    const result = stmt.run(name);
    res.status(201).json({
        id: Number(result.lastInsertRowid),
        name: name,
    });
});

app.delete("/playlists/:id", (req, res) => {
const stmt = db.prepare("DELETE FROM Playlist WHERE PlaylistId = ?");
const result = stmt.run(req.params.id);
if (result.changes === 0) {
return res.status(404).json({ error: "Playlist not found" });
}
res.json({ message: "Playlist deleted" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});