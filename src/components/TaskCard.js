import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Checkbox,
  Box,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format, isToday, isPast } from 'date-fns';

const FIXED_TAGS = [
  { label: 'Work', color: 'primary' },
  { label: 'Urgent', color: 'error' },
  { label: 'Personal', color: 'secondary' },
  { label: 'Home', color: 'info' },
  { label: 'Other', color: 'default' },
];

const TaskCard = ({ task, onDelete, onEdit, onToggleComplete }) => {
  const { id, title, description, completed, createdAt, updatedAt, deadline, isDaily, dailyTime } = task;

  const isOverdue = deadline && isPast(new Date(deadline)) && !completed;
  const isDueToday = deadline && isToday(new Date(deadline));

  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative',
        border: isOverdue ? '1px solid #ff1744' : 'none',
        backgroundColor: isOverdue ? 'rgba(255, 23, 68, 0.04)' : 'inherit',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox
            checked={completed}
            onChange={() => onToggleComplete(id, !completed)}
            color="primary"
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              textDecoration: completed ? 'line-through' : 'none',
              color: completed ? 'text.secondary' : 'text.primary',
            }}
          >
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            icon={<CalendarIcon />}
            label={`Created: ${format(createdAt.toDate(), 'MM/dd/yyyy')}`}
            size="small"
            variant="outlined"
          />
          {updatedAt.toDate() !== createdAt.toDate() && (
            <Chip
              icon={<CalendarIcon />}
              label={`Updated: ${format(updatedAt.toDate(), 'MM/dd/yyyy')}`}
              size="small"
              variant="outlined"
            />
          )}
          {deadline && (
            <Chip
              icon={<TimeIcon />}
              label={`Deadline: ${format(new Date(deadline), 'MMM d, yyyy HH:mm')}`}
              size="small"
              color={isOverdue ? 'error' : isDueToday ? 'warning' : 'default'}
              variant="outlined"
            />
          )}
          {isDaily && dailyTime && (
            <Chip
              icon={<TimeIcon />}
              label={`Daily at: ${format(new Date(`2000-01-01T${dailyTime}`), 'HH:mm')}`}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
          <Chip
            label={completed ? 'Completed' : 'Pending'}
            size="small"
            color={completed ? 'success' : 'warning'}
          />
        </Box>
        {/* Tags chips */}
        {Array.isArray(task.tags) && task.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {task.tags.map((tag) => (
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
          onClick={() => onEdit(task)}
          aria-label="edit task"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(id)}
          aria-label="delete task"
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default TaskCard; 