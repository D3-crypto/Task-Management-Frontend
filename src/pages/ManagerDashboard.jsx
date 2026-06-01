import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { LogOut, Plus, Trash2, Edit2, Filter, CheckCircle, XCircle } from 'lucide-react'

const ManagerDashboard = () => {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', assignedEmployee: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  useEffect(() => {
    fetchTasks()
    fetchEmployees()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data.data.items || res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/users?role=employee')
      setEmployees(res.data.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/tasks', newTask)
      setTasks([res.data.data.task, ...tasks])
      setIsModalOpen(false)
      setNewTask({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', assignedEmployee: '' })
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

  const handleReview = async (id, action) => {
    try {
      const res = await api.patch(`/tasks/${id}/review`, { action })
      setTasks(tasks.map(t => t._id === id ? res.data.data.task : t))
    } catch (err) {
      console.error(err)
    }
  }

  const filteredTasks = tasks.filter(t => {
    const statusMatch = statusFilter === 'All' || t.status === statusFilter
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">Managed Tasks</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Tasks Overview</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Assign New Task
          </button>
        </header>

        <div className="filters-bar">
          <Filter size={20} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status:</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.4rem 0.8rem' }}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Priority:</label>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '0.4rem 0.8rem' }}>
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="task-grid">
          {filteredTasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks found matching criteria.</p>}
          {filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <div className="task-title">{task.title}</div>
                <div className={`badge badge-${task.status.replace(' ', '-').toLowerCase()}`}>
                  {task.status}
                </div>
              </div>
              <div className="task-desc">{task.description}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Assigned to:</strong> {task.assignedEmployee?.name || 'Unknown'} <br/>
                <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()} <br/>
                <strong>Priority:</strong> <span style={{ color: task.priority === 'High' ? 'var(--danger)' : 'inherit' }}>{task.priority}</span>
              </div>
              
              <div className="task-footer">
                {task.status === 'Under Review' ? (
                  <div className="review-actions">
                    <button onClick={() => handleReview(task._id, 'approve')} className="btn btn-success" style={{ flex: 1, padding: '0.5rem' }}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleReview(task._id, 'reject')} className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => handleDelete(task._id)} className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="solid-card" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create & Assign Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows={3} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Assign to Employee</label>
                <select value={newTask.assignedEmployee} onChange={e => setNewTask({...newTask, assignedEmployee: e.target.value})} required>
                  <option value="" disabled>Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard
