import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { LogOut, Users, CheckCircle, Plus, AlertCircle, Filter } from 'lucide-react'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [roleFilter, setRoleFilter] = useState('All')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats')
      setStats(statsRes.data.data.stats)
      const usersRes = await api.get('/admin/users')
      setUsers(usersRes.data.data.items || usersRes.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/admin/users', newUser)
      setUsers([res.data.data.user, ...users])
      setIsModalOpen(false)
      setNewUser({ name: '', email: '', password: '', role: 'employee' })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredUsers = roleFilter === 'All' ? users : users.filter(u => u.role === roleFilter.toLowerCase())

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrator</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">System Overview</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Admin Overview</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Create User
          </button>
        </header>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="solid-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(29, 78, 216, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}><Users size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                <div style={{ color: 'var(--text-muted)' }}>Total Users ({stats.totalManagers} M / {stats.totalEmployees} E)</div>
              </div>
            </div>
            <div className="solid-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)' }}><CheckCircle size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalTasks}</div>
                <div style={{ color: 'var(--text-muted)' }}>Total Tasks ({stats.completedTasks} Done)</div>
              </div>
            </div>
            <div className="solid-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--warning)' }}><AlertCircle size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.underReviewTasks || 0}</div>
                <div style={{ color: 'var(--text-muted)' }}>Tasks Under Review</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>System Users</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
              <option value="All">All Roles</option>
              <option value="Manager">Managers</option>
              <option value="Employee">Employees</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="solid-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', background: 'var(--bg-color)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
              )}
              {filteredUsers.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${u.role === 'admin' ? 'completed' : u.role === 'manager' ? 'in-progress' : 'pending'}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="solid-card" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
