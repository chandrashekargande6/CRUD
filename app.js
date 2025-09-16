// Warp Notes Frontend JavaScript
const API_BASE_URL = 'https://crud-19es.onrender.com';

// DOM Elements
const noteForm = document.getElementById('note-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const notesContainer = document.getElementById('notes-container');
const messageDiv = document.getElementById('message');

// State
let currentEditingId = null;
let notes = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    noteForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Load all notes
async function loadNotes() {
    try {
        showLoading();
        notes = await apiCall('/notes');
        renderNotes();
        hideMessage();
    } catch (error) {
        showError('Failed to load notes. Please try again.');
        console.error('Error loading notes:', error);
    }
}

// Create a new note
async function createNote(noteData) {
    try {
        const newNote = await apiCall('/notes', 'POST', noteData);
        notes.push(newNote);
        renderNotes();
        resetForm();
        showSuccess('Note created successfully!');
        return newNote;
    } catch (error) {
        showError('Failed to create note. Please try again.');
        console.error('Error creating note:', error);
        throw error;
    }
}

// Update an existing note
async function updateNote(id, noteData) {
    try {
        const updatedNote = await apiCall(`/notes/${id}`, 'PUT', noteData);
        const index = notes.findIndex(note => note.id === id);
        if (index !== -1) {
            notes[index] = updatedNote;
        }
        renderNotes();
        resetForm();
        showSuccess('Note updated successfully!');
        return updatedNote;
    } catch (error) {
        showError('Failed to update note. Please try again.');
        console.error('Error updating note:', error);
        throw error;
    }
}

// Delete a note
async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        await apiCall(`/notes/${id}`, 'DELETE');
        notes = notes.filter(note => note.id !== id);
        renderNotes();
        showSuccess('Note deleted successfully!');
        
        // If we were editing this note, cancel the edit
        if (currentEditingId === id) {
            cancelEdit();
        }
    } catch (error) {
        showError('Failed to delete note. Please try again.');
        console.error('Error deleting note:', error);
    }
}

// Form handling
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(noteForm);
    const noteData = {
        title: formData.get('title').trim(),
        content: formData.get('content').trim()
    };

    // Validation
    if (!noteData.title || !noteData.content) {
        showError('Please fill in both title and content.');
        return;
    }

    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';

    try {
        if (currentEditingId) {
            await updateNote(currentEditingId, noteData);
        } else {
            await createNote(noteData);
        }
    } catch (error) {
        // Error handling is done in the individual functions
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Edit note
function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentEditingId = id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    
    formTitle.textContent = 'Edit Note';
    submitBtn.textContent = 'Update Note';
    submitBtn.className = 'btn btn-success';
    cancelBtn.style.display = 'inline-block';

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    titleInput.focus();
}

// Cancel edit
function cancelEdit() {
    resetForm();
}

// Reset form to initial state
function resetForm() {
    currentEditingId = null;
    noteForm.reset();
    formTitle.textContent = 'Add New Note';
    submitBtn.textContent = 'Add Note';
    submitBtn.className = 'btn';
    cancelBtn.style.display = 'none';
    hideMessage();
}

// Render notes
function renderNotes() {
    if (notes.length === 0) {
        notesContainer.innerHTML = '<div class="no-notes">No notes yet. Create your first note above!</div>';
        return;
    }

    const notesGrid = document.createElement('div');
    notesGrid.className = 'notes-grid';

    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        
        // Truncate content if too long
        const truncatedContent = note.content.length > 150 
            ? note.content.substring(0, 150) + '...' 
            : note.content;

        noteCard.innerHTML = `
            <div class="note-title">${escapeHtml(note.title)}</div>
            <div class="note-content">${escapeHtml(truncatedContent)}</div>
            <div class="note-actions">
                <button class="btn btn-secondary" onclick="editNote('${note.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        `;

        notesGrid.appendChild(noteCard);
    });

    notesContainer.innerHTML = '';
    notesContainer.appendChild(notesGrid);
}

// Utility functions
function showLoading() {
    notesContainer.innerHTML = '<div class="loading">Loading notes...</div>';
}

function showError(message) {
    messageDiv.innerHTML = `<div class="error">${message}</div>`;
    setTimeout(hideMessage, 5000);
}

function showSuccess(message) {
    messageDiv.innerHTML = `<div class="success">${message}</div>`;
    setTimeout(hideMessage, 3000);
}

function hideMessage() {
    messageDiv.innerHTML = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.editNote = editNote;
window.deleteNote = deleteNote;

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please refresh the page.');
});

// Auto-refresh notes every 30 seconds to stay in sync
setInterval(() => {
    if (!currentEditingId) { // Don't refresh while editing
        loadNotes();
    }
}, 30000);