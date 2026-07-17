import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Sprout,
  ShoppingBag,
  Package,
  Layers,
  ClipboardList,
  Wrench,
  CreditCard,
  TrendingUp,
  DollarSign,
  BarChart3,
  Bell,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Agro Companies', path: '/companies', icon: Building2 },
      { label: 'Farmers', path: '/farmers', icon: Sprout },
      { label: 'Buyers', path: '/buyers', icon: ShoppingBag },
      { label: 'Products', path: '/products', icon: Package },
      { label: 'Categories', path: '/categories', icon: Layers },
      { label: 'Orders', path: '/orders', icon: ClipboardList },
      { label: 'Services', path: '/services', icon: Wrench },
      { label: 'Payments', path: '/payments', icon: CreditCard }
    ]
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Sales', path: '/sales', icon: TrendingUp },
      { label: 'Revenue', path: '/revenue', icon: DollarSign },
      { label: 'Reports', path: '/reports', icon: BarChart3 }
    ]
  },
  {
    title: 'Communication',
    items: [
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Reviews', path: '/reviews', icon: MessageSquare }
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
      { label: 'Profile', path: '/profile', icon: User }
    ]
  }
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();

  // Layout States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Dropdown Refs for Click Outside Close
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Auto-close drawers on path changes
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  // Click Outside to Close Dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme Toggle Handler
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Logout Handler
  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    success('Logged out successfully');
    navigate('/auth/login');
  };

  // Dummy Notifications
  const dummyNotifications = [
    { id: 1, text: 'New farmer registered: Rahman S.', time: '5m ago' },
    { id: 2, text: 'Payment verification pending ($1,240)', time: '1h ago' },
    { id: 3, text: 'Low stock warning: Urea Fertilizer', time: '3h ago' }
  ];

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* 1. SIDEBAR (Desktop) */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-primary text-primary-foreground border-r border-border/10 relative transition-all duration-300 z-30 shrink-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0 justify-between">
          <div className={cn('flex items-center gap-2 overflow-hidden transition-all', isCollapsed && 'opacity-0 scale-95 w-0')}>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">AgroMED Connect</span>
          </div>
          {isCollapsed && (
            <span className="font-bold text-lg tracking-tight mx-auto">AM</span>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && sec.title && (
                <h4 className="px-3 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  {sec.title}
                </h4>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative cursor-pointer',
                        isActive
                          ? 'bg-secondary text-primary-foreground font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isCollapsed && (
                      <div className="absolute left-full rounded-md px-2 py-1 ml-4 bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 border border-white/5">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>

        {/* Sidebar Collapse Toggle Trigger */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-16 -right-3.5 bg-primary border border-white/10 hover:bg-primary/95 text-primary-foreground rounded-full p-1 shadow-md cursor-pointer flex items-center justify-center z-50"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-primary text-primary-foreground border-r border-white/10 z-10 animate-in slide-in-from-left duration-250">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
              <span className="font-bold text-lg">AgroMED Connect</span>
              <button onClick={() => setIsMobileOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  {sec.title && (
                    <h4 className="px-3 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                      {sec.title}
                    </h4>
                  )}
                  <div className="space-y-0.5">
                    {sec.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
                            isActive
                              ? 'bg-secondary text-primary-foreground font-semibold'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          )
                        }
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-white/5">
              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="truncate">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/80 bg-card flex items-center justify-between px-4 md:px-6 shrink-0 relative z-20 shadow-sm">
          {/* Hamburger Menu & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search Bar Placeholder */}
            <div className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 text-xs md:text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              />
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-3 md:gap-4.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  'p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors relative cursor-pointer',
                  isNotificationsOpen && 'bg-muted text-foreground'
                )}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-secondary border border-card" />
              </button>

              {/* Slide-down notifications menu */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-card border border-border/80 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">Notifications</span>
                    <span className="text-[10px] text-info font-semibold cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-border/40 max-h-64 overflow-y-auto">
                    {dummyNotifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-muted/40 transition-colors flex flex-col gap-1 cursor-pointer">
                        <p className="text-xs text-foreground/80 font-medium leading-normal">{notif.text}</p>
                        <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-1.5 border-t border-border/60 text-center">
                    <NavLink
                      to="/notifications"
                      className="text-xs text-primary hover:text-primary/95 font-semibold inline-block py-1 hover:underline"
                    >
                      View all notifications
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-5 w-px bg-border/80" />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-secondary text-primary-foreground border border-secondary/20 flex items-center justify-center font-bold text-xs">
                  YS
                </div>
                <div className="text-left hidden lg:block pr-1 leading-tight">
                  <p className="text-xs font-semibold text-foreground">Yusuf Siyam</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Administrator</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
              </button>

              {/* Profile Dropdown Options */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-card border border-border/80 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-border/60 lg:hidden">
                    <p className="text-xs font-semibold text-foreground">Yusuf Siyam</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Administrator</p>
                  </div>
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                  <div className="border-t border-border/60 my-1" />
                  <button
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-accent/20">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Confirm Logout"
        description="Are you sure you want to log out of the AgroMED Connect Admin panel? You will need to enter your credentials to log back in."
        confirmText="Logout"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}
