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
  FormControlLabel,
  Switch,
  FormHelperText,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskCard from '../TaskCard';
import { useAuth } from '../../contexts/AuthContext';
import { createTask, getTasks, updateTask, deleteTask, toggleTaskComplete } from '../../services/firebase/tasks';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { isToday } from 'date-fns';

const FIXED_TAGS = [
  { label: 'Work', color: 'primary' },
  { label: 'Urgent', color: 'error' },
  { label: 'Personal', color: 'secondary' },
  { label: 'Home', color: 'info' },
  { label: 'Other', color: 'default' },
];

const validateTaskForm = (formData) => {
  const errors = {};
  // Title: required, 1-100 chars
  if (!formData.title || typeof formData.title !== 'string' || formData.title.trim().length < 1) {
    errors.title = 'Title is required.';
  } else if (formData.title.length > 100) {
    errors.title = 'Title must be at most 100 characters.';
  }
  // Description: optional, max 1000 chars
  if (formData.description && formData.description.length > 1000) {
    errors.description = 'Description must be at most 1000 characters.';
  }
  // isDaily: required boolean
  if (typeof formData.isDaily !== 'boolean') {
    errors.isDaily = 'Daily task switch must be set.';
  }
  // dailyTime: if isDaily, must be valid time string
  if (formData.isDaily) {
    if (!formData.dailyTime) {
      errors.dailyTime = 'Daily time is required for daily tasks.';
    } else if (Object.prototype.toString.call(formData.dailyTime) === '[object Date]') {
      // valid
    } else {
      errors.dailyTime = 'Invalid daily time.';
    }
  }
  // deadline: optional, must be valid date if provided
  if (formData.deadline && Object.prototype.toString.call(formData.deadline) !== '[object Date]') {
    errors.deadline = 'Invalid deadline date.';
  }
  return errors;
};

const Tasks = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: null,
    isDaily: false,
    dailyTime: null,
    tags: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [todayDueTasks, setTodayDueTasks] = useState([]);
  const [showTodaySnackbar, setShowTodaySnackbar] = useState(false);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      const tasksList = await getTasks(currentUser.uid);
      setTasks(tasksList);
      // Check for today's deadlines
      const dueToday = tasksList.filter(
        (task) => task.deadline && !task.completed && isToday(new Date(task.deadline))
      );
      setTodayDueTasks(dueToday);
      setShowTodaySnackbar(dueToday.length > 0);
    } catch (error) {
      setSubmitError('Error loading tasks: ' + error.message);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      deadline: null,
      isDaily: false,
      dailyTime: null,
      tags: [],
    });
    setFormErrors({});
    setSubmitError('');
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline ? new Date(task.deadline) : null,
      isDaily: task.isDaily || false,
      dailyTime: task.dailyTime ? new Date(`2000-01-01T${task.dailyTime}`) : null,
      tags: task.tags || [],
    });
    setOpen(true);
    setFormErrors({});
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitError('');
    const errors = validateTaskForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const taskData = {
        ...formData,
        userId: currentUser.uid,
        completed: editingTask?.completed || false,
        deadline: formData.deadline ? formData.deadline.toISOString() : null,
        dailyTime: formData.isDaily && formData.dailyTime ? formData.dailyTime.toTimeString().slice(0, 5) : null,
        tags: formData.tags,
      };
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      handleClose();
      loadTasks();
    } catch (error) {
      console.log(error);
      setSubmitError(error.message || 'Error saving task.');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (error) {
      setSubmitError('Error deleting task: ' + error.message);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await toggleTaskComplete(taskId, completed);
      loadTasks();
    } catch (error) {
      setSubmitError('Error toggling task completion: ' + error.message);
    }
  };

  return (
    <Box>
      {/* Snackbar for today's deadlines */}
      <Snackbar
        open={showTodaySnackbar}
        autoHideDuration={8000}
        onClose={() => setShowTodaySnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setShowTodaySnackbar(false)} severity="warning" sx={{ width: '100%' }}>
          {todayDueTasks.length === 1
            ? `You have 1 task due today: ${todayDueTasks[0].title}`
            : todayDueTasks.length > 1
              ? `You have ${todayDueTasks.length} tasks due today!`
              : ''}
        </MuiAlert>
      </Snackbar>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Task
        </Button>
      </Box>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <TaskCard
              task={task}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleComplete={handleToggleComplete}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <form onSubmit={handleSubmit} noValidate>
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
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              error={!!formErrors.description}
              helperText={formErrors.description}
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ mt: 2 }}>
                <DateTimePicker
                  label="Deadline"
                  value={formData.deadline}
                  onChange={(newValue) =>
                    setFormData({ ...formData, deadline: newValue })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth error={!!formErrors.deadline} helperText={formErrors.deadline} />}
                />
              </Box>
            </LocalizationProvider>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDaily}
                  onChange={(e) =>
                    setFormData({ ...formData, isDaily: e.target.checked, dailyTime: e.target.checked ? formData.dailyTime : null })
                  }
                />
              }
              label="Daily Task"
              sx={{ mt: 2 }}
            />
            {formData.isDaily && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ mt: 2 }}>
                  <TimePicker
                    label="Daily Time"
                    value={formData.dailyTime}
                    onChange={(newValue) =>
                      setFormData({ ...formData, dailyTime: newValue })
                    }
                    renderInput={(params) => <TextField {...params} fullWidth error={!!formErrors.dailyTime} helperText={formErrors.dailyTime} />}
                  />
                  <FormHelperText>
                    Set the time for this daily task
                  </FormHelperText>
                </Box>
              </LocalizationProvider>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTask ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Tasks; 