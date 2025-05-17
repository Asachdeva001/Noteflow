import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { getTasks } from '../services/firebase/tasks';
import { getNotes } from '../services/firebase/notes';
import { useAuth } from '../contexts/AuthContext';
import { query, collection, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase/config';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function getMonthRange(date) {
  // date is the first visible date in the calendar
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function Dashboard() {
  const { currentUser } = useAuth ? useAuth : { currentUser: null };
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [calendarRange, setCalendarRange] = useState(getMonthRange(new Date()));

  // Fetch stats (all tasks/notes count) as before
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      try {
        const tasksList = await getTasks(currentUser.uid);
        const notesList = await getNotes(currentUser.uid);
        setStats({
          totalTasks: tasksList.length,
          completedTasks: tasksList.filter((task) => task.completed).length,
          totalNotes: notesList.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      setLoading(false);
    };
    fetchStats();
    // eslint-disable-next-line
  }, [currentUser]);

  // Fetch only tasks for the visible calendar range
  const fetchTasksForRange = useCallback(async (range) => {
    if (!currentUser) return;
    setCalendarLoading(true);
    try {
      // Custom query for tasks in range
      const { start, end } = range;
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('deadline', '>=', start.toISOString()),
        where('deadline', '<=', end.toISOString())
      );
      const snapshot = await getDocs(tasksQuery);
      const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks for calendar:', error);
    } finally {
      setCalendarLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTasksForRange(calendarRange);
  }, [calendarRange, fetchTasksForRange]);

  // react-big-calendar onRangeChange handler
  const handleRangeChange = (range) => {
    // range can be an array (month view) or object (week/day)
    let start, end;
    if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else if (range.start && range.end) {
      start = range.start;
      end = range.end;
    } else {
      // fallback to current month
      const r = getMonthRange(new Date());
      start = r.start;
      end = r.end;
    }
    setCalendarRange({ start, end });
  };

  // Map tasks to calendar events
  const events = tasks
    .filter((task) => task.deadline)
    .map((task) => ({
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(task.deadline),
      allDay: true,
      resource: task,
    }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="h3">{stats.totalTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Completed Tasks
            </Typography>
            <Typography variant="h3">{stats.completedTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Notes
            </Typography>
            <Typography variant="h3">{stats.totalNotes}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Task Calendar
        </Typography>
        <div style={{ height: 500, position: 'relative' }}>
          {calendarLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, background: 'rgba(255,255,255,0.7)' }}>
              <CircularProgress />
            </Box>
          )}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 450, opacity: calendarLoading ? 0.5 : 1 }}
            popup
            onRangeChange={handleRangeChange}
          />
        </div>
      </Paper>
    </Box>
  );
}

export default Dashboard; 