const API_URL = "/notes"; // Relative URL, works on same domain

const notesContainer = document.getElementById('notes-container');
const noteIdInput = document.getElementById('note-id');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');

// Fetch and display all notes
async function fetchNotes() {
  const res = await fetch(API_URL);
  const notes = await res.json();
  notesContainer.innerHTML = '';
  notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = `
      <strong>${note.title}</strong>
      <p>${note.content}</p>
      <button onclick="editNote('${note.id}', '${note.title}', '${note.content}')">Edit</button>
      <button onclick="deleteNote('${note.id}')">Delete</button>
    `;
    notesContainer.appendChild(div);
  });
}

// Save or update note
async function saveNote() {
  const id = noteIdInput.value;
  const data = { title: titleInput.value, content: contentInput.value };
  if (!data.title) { alert("Title is required"); return; }

  if (id) {
    // Update note
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } else {
    // Create new note
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  resetForm();
  fetchNotes();
}

// Edit note
function editNote(id, title, content) {
  noteIdInput.value = id;
  titleInput.value = title;
  contentInput.value = content;
}

// Delete note
async function deleteNote(id) {
  if (!confirm("Are you sure you want to delete this note?")) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  fetchNotes();
}

// Reset form
function resetForm() {
  noteIdInput.value = '';
  titleInput.value = '';
  contentInput.value = '';
}

// Initial load
fetchNotes();
