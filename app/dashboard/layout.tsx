// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: 200, background: '#eee', padding: 20 }}>
        <h3>Admin Panel</h3>
        <a href="/dashboard">Dashboard Home</a><br />
        <a href="/dashboard/posts">Manage Posts</a><br />
        <a href="/dashboard/categories">Manage Categories</a>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>{children}</main>
    </div>
  );
}