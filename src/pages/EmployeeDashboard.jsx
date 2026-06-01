import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { LogOut, Filter } from 'lucide-react'

const EmployeeDashboard = () => {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/my-tasks').catch(() => api.get('/tasks'))
      setTasks(res.data.data.items || res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status })
      setTasks(tasks.map(t => t._id === id ? res.data.data.task : t))
    } catch (err) {
      console.error(err)
    }
  }

  const filteredTasks = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter)

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employee</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">My Assignments</div>
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
        </header>

        <div className="filters-bar">
          <Filter size={20} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter by Status:</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '150px', padding: '0.4rem 0.8rem' }}
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="task-grid">
          {filteredTasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks found.</p>}
          {filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <div className="task-title">{task.title}</div>
                <div className={`badge badge-${task.status.replace(' ', '-').toLowerCase()}`}>
                  {task.status}
                </div>
              </div>
              <div className="task-desc">{task.description}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()} <br/>
                <strong>Priority:</strong> <span style={{ color: task.priority === 'High' ? 'var(--danger)' : 'inherit' }}>{task.priority}</span>
              </div>
              
              <div className="task-footer" style={{ marginTop: 'auto' }}>
                {task.status === 'Completed' ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 500 }}>Task Completed</span>
                ) : task.status === 'Under Review' ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>Awaiting Manager Review</span>
                ) : (
                  <>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update Status:</span>
                    <select 
                      value={task.status} 
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
                    >
                      {task.status === 'Pending' && <option value="Pending">Pending</option>}
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Submit for Review</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default EmployeeDashboard
