import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './page.css';

export default function Page() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Load tasks from local storage on mount
  useEffect(() => {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const userData = localStorage.getItem("user");

    if (isGuest) {
      // Use sample data for guest mode
      setUser({ name: 'Guest User', email: 'guest@example.com' });
      const guestTasks = localStorage.getItem('guestTasks');
      if (guestTasks) {
        setTasks(JSON.parse(guestTasks));
      } else {
        const defaultTasks = [
          { id: Date.now().toString(), text: 'Sample Task 1', date: new Date().toISOString().split('T')[0] },
          { id: (Date.now() + 1).toString(), text: 'Sample Task 2', date: new Date().toISOString().split('T')[0] }
        ];
        setTasks(defaultTasks);
        localStorage.setItem('guestTasks', JSON.stringify(defaultTasks));
      }
      setLoading(false);
    } else if (userData) {
      // Regular user - load tasks from local storage
      (async () => {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          // Fetch tasks from backend
          const res = await fetch(`/api/tasks/${encodeURIComponent(parsedUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            setTasks(data.map(t => ({ id: t._id, text: t.text, date: t.date })));
          }
        } catch (err) {
          console.error('Error fetching tasks:', err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // No user and not in guest mode
      navigate('/');
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isGuest");
    navigate("/");
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      date: taskDate || new Date().toISOString().split('T')[0]
    };

    // If user is real user, persist to backend
    if (user && user.email !== 'guest@example.com') {
      (async () => {
        try {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: user.email, text: newTask.text, date: newTask.date })
          });
          if (res.ok) {
            const saved = await res.json();
            setTasks(prev => [...prev, { id: saved._id, text: saved.text, date: saved.date }]);
          }
        } catch (err) {
          console.error('Error saving task:', err);
        }
      })();
    } else {
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('guestTasks', JSON.stringify(updatedTasks));
    }

    setTaskText('');
    setTaskDate('');
  };

  const handleDeleteTask = (id) => {
    // If persisted in backend, delete there as well
    if (user && user.email !== 'guest@example.com') {
      (async () => {
        try {
          const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setTasks(prev => prev.filter(task => task.id !== id));
          }
        } catch (err) {
          console.error('Error deleting task:', err);
        }
      })();
    } else {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem('guestTasks', JSON.stringify(updatedTasks));
    }
  };

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setStopwatchTime(0);
  };

  // Show loading or nothing if not authenticated
  if (!user || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: '#ffffffb9',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div id="header">
        Welcome {user.username || user.email}!
        <button
          onClick={handleLogout}
          style={{
            float: 'right',
            marginRight: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      <div id="container">
        <div id="tasks">
          <h1>Tasks Lists</h1>
          <div id="taskitems">
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '2rem', color: '#ffffffb9' }}>
                No tasks yet. Add a task to get started!
              </div>
            ) : (
              <ul id="taskList">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="task-text">
                      {task.text} - {formatDate(task.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div id="rightside">
          <div id="addtask">
            <div>
              <input
                id="inp1"
                type="text"
                placeholder="Enter your task here"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
              />
              <input
                id="inp2"
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
            </div>
            <div id="btn1">
              <button id="addTaskBtn" onClick={handleAddTask}>Add Task</button>
            </div>
          </div>
          <div id="stopwatch">
            <div id="line">Stop Watch</div>
            <input id="inp3" type="text" value={formatTime(stopwatchTime)} readOnly />
            <div id="btns">
              <button id="startBtn" onClick={handleStart} disabled={isRunning}>Start</button>
              <button id="stopBtn" onClick={handleStop} disabled={!isRunning}>Stop</button>
              <button id="resetBtn" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
