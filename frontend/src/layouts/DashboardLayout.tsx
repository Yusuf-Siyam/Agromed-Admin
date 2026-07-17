import { Outlet, Link } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-primary text-primary-foreground border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-wider">AgroMED Connect</h1>
          <p className="text-xs opacity-75">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
          <Link to="/dashboard" className="block px-4 py-2 rounded-md hover:bg-white/10">Dashboard</Link>
          <Link to="/companies" className="block px-4 py-2 rounded-md hover:bg-white/10">Agro Companies</Link>
          <Link to="/farmers" className="block px-4 py-2 rounded-md hover:bg-white/10">Farmers</Link>
          <Link to="/buyers" className="block px-4 py-2 rounded-md hover:bg-white/10">Buyers</Link>
          <Link to="/products" className="block px-4 py-2 rounded-md hover:bg-white/10">Products</Link>
          <Link to="/categories" className="block px-4 py-2 rounded-md hover:bg-white/10">Categories</Link>
          <Link to="/orders" className="block px-4 py-2 rounded-md hover:bg-white/10">Orders</Link>
          <Link to="/services" className="block px-4 py-2 rounded-md hover:bg-white/10">Services</Link>
          <Link to="/payments" className="block px-4 py-2 rounded-md hover:bg-white/10">Payments</Link>
          <Link to="/sales" className="block px-4 py-2 rounded-md hover:bg-white/10">Sales</Link>
          <Link to="/revenue" className="block px-4 py-2 rounded-md hover:bg-white/10">Revenue</Link>
          <Link to="/reports" className="block px-4 py-2 rounded-md hover:bg-white/10">Reports</Link>
          <Link to="/notifications" className="block px-4 py-2 rounded-md hover:bg-white/10">Notifications</Link>
          <Link to="/reviews" className="block px-4 py-2 rounded-md hover:bg-white/10">Reviews</Link>
          <Link to="/settings" className="block px-4 py-2 rounded-md hover:bg-white/10">Settings</Link>
          <Link to="/profile" className="block px-4 py-2 rounded-md hover:bg-white/10">Profile</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="text-lg font-medium text-foreground">Admin Workspace</div>
          <div className="flex items-center space-x-4">
            <Link to="/auth/login" className="text-sm font-medium hover:underline text-foreground">Logout</Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-accent/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
