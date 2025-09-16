const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Root route redirects to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// In-memory notes storage
let notes = [
  { id: randomUUID(), title: "Welcome", content: "This is your first note." }
];

// CRUD endpoints
app.get('/notes', (req, res) => res.json(notes));

app.get('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const newNote = { id: randomUUID(), title, content: content || "" };
  notes.push(newNote);
  res.status(201).json(newNote);
});

app.put('/notes/:id', (req, res) => {
  const { title, content } = req.body;
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });
  notes[idx] = { ...notes[idx], title: title ?? notes[idx].title, content: content ?? notes[idx].content };
  res.json(notes[idx]);
});

app.delete('/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });
  const deleted = notes.splice(idx, 1)[0];
  res.json({ deleted });
});

// Dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Warp Notes API running on port ${PORT}`));
