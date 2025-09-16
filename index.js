// index.js
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory notes storage
let notes = [
  { id: randomUUID(), title: "Welcome", content: "This is your first note." }
];

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Welcome to Warp Notes API 🚀 Use /notes to manage notes');
});

// Get all notes
app.get('/notes', (req, res) => {
  res.json(notes);
});

// Get a single note by ID
app.get('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// Create a new note
app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const newNote = { id: randomUUID(), title, content: content || "" };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// Update a note
app.put('/notes/:id', (req, res) => {
  const { title, content } = req.body;
  const index = notes.findIndex(n => n.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: "Note not found" });

  notes[index] = {
    ...notes[index],
    title: title ?? notes[index].title,
    content: content ?? notes[index].content
  };

  res.json(notes[index]);
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: "Note not found" });

  const deleted = notes.splice(index, 1)[0];
  res.json({ deleted });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Notes API running on http://localhost:${PORT}`));
