import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { LogOut, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/tasks', newTask)
      setTasks([...tasks, res.data.data])
      setIsModalOpen(false)
      setNewTask({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/tasks/${id}`, { status })
      setTasks(tasks.map(t => t._id === id ? res.data.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">Dashboard</div>
          {user?.role === 'admin' && (
            <div className="nav-item" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
              <ShieldAlert size={18} /> Admin Panel
            </div>
          )}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>My Tasks</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> New Task
          </button>
        </header>

        <div className="task-grid">
          {tasks.map(task => (
            <div key={task._id} className="task-card glass-panel">
              <div className="task-header">
                <div className="task-title">{task.title}</div>
                <div className={`badge badge-${task.status.replace(' ', '-')}`}>
                  {task.status}
                </div>
              </div>
              <div className="task-desc">{task.description}</div>
              <div className="task-footer">
                <select 
                  value={task.status} 
                  onChange={(e) => updateStatus(task._id, e.target.value)}
                  style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
