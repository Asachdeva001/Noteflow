import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import NoteCard from '../NoteCard';
import { useAuth } from '../../contexts/AuthContext';
import { createNote, getNotes, updateNote, deleteNote } from '../../services/firebase/notes';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

const FIXED_TAGS = [
  { label: 'Work', color: 'primary' },
  { label: 'Urgent', color: 'error' },
  { label: 'Personal', color: 'secondary' },
  { label: 'Home', color: 'info' },
  { label: 'Other', color: 'default' },
];

const Notes = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
  });

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line
  }, [currentUser]);

  const loadNotes = async () => {
    try {
      const notesList = await getNotes(currentUser.uid);
      setNotes(notesList);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', tags: [] });
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const noteData = {
        ...formData,
        userId: currentUser.uid,
        tags: formData.tags,
      };

      if (editingNote) {
        await updateNote(editingNote.id, noteData);
      } else {
        await createNote(noteData);
      }

      handleClose();
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Note
        </Button>
      </Box>

      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <NoteCard
              note={note}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={8}
              required
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <Autocomplete
              multiple
              options={FIXED_TAGS.map((tag) => tag.label)}
              freeSolo
              value={formData.tags}
              onChange={(_, newValue) => setFormData({ ...formData, tags: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="filled"
                    color={FIXED_TAGS.find((t) => t.label === option)?.color || 'default'}
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Tags" placeholder="Select or type tags" sx={{ mt: 2 }} />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingNote ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Notes; 