import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const FIXED_TAGS = [
  { label: 'Work', color: 'primary' },
  { label: 'Urgent', color: 'error' },
  { label: 'Personal', color: 'secondary' },
  { label: 'Home', color: 'info' },
  { label: 'Other', color: 'default' },
];

const NoteCard = ({ note, onDelete, onEdit }) => {
  const { id, title, content, createdAt, updatedAt } = note;

  return (
    <Card sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {content}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Created: ${format(createdAt.toDate(), 'MM/dd/yyyy')}`}
            size="small"
            variant="outlined"
          />
          {updatedAt.toDate() !== createdAt.toDate() && (
            <Chip
              label={`Updated: ${format(updatedAt.toDate(), 'MM/dd/yyyy')}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        {/* Tags chips */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={FIXED_TAGS.find((t) => t.label === tag)?.color || 'default'}
                size="small"
                variant="filled"
              />
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions>
        <IconButton
          size="small"
          onClick={() => onEdit(note)}
          aria-label="edit note"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(id)}
          aria-label="delete note"
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default NoteCard; 