'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

export default function SidebarNav({ currentView, onNavigateToHome, onNavigateToInspiration, onNavigateToMyVideos, onNavigateToText, onNavigateToImage }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const navItems = [
    { label: 'Home', icon: HomeIcon, view: 'home', onClick: onNavigateToHome },
    { label: 'Inspiration', icon: SparklesIcon, view: 'inspiration', onClick: onNavigateToInspiration },
    { label: 'My Videos', icon: VideoIcon, view: 'my-videos', onClick: onNavigateToMyVideos },
  ];

  const aiItems = [
    { label: 'Text to Video', icon: TextIcon, view: 'text-to-video', onClick: onNavigateToText },
    { label: 'Image to Video', icon: ImageIcon, view: 'image-to-video', onClick: onNavigateToImage },
  ];

  const initials =
    (user?.full_name && user.full_name.trim()[0]?.toUpperCase()) ||
    (user?.email && user.email.trim()[0]?.toUpperCase()) ||
    'U';

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    router.push('/');
  };

  return (
    <aside className="group/sidebar hidden lg:flex flex-col bg-gray-900/80 border-r border-gray-800/80 backdrop-blur-md fixed top-0 left-0 h-full z-40 w-16 hover:w-64 transition-all duration-300">
      <div className="flex-1 px-3 py-6 space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center text-white font-bold text-lg">
            V3
          </div>
          <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            <p className="text-sm font-semibold text-white truncate">V3 VideoGen</p>
            <p className="text-xs text-gray-400 truncate">AI Video Studio</p>
          </div>
        </div>

        {/* Main nav */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all ${
                currentView === item.view
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 text-purple-300" />
              <span className="text-sm font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* AI Generate */}
        <div className="space-y-2">
          <p className="px-2 text-[11px] uppercase tracking-wide text-gray-500 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            AI Generate
          </p>
          <div className="space-y-1">
            {aiItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all ${
                  currentView === item.view
                    ? 'text-white bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 text-blue-300" />
                <span className="text-sm font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile / Logout */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-800/80">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800/70 transition-all">
          <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          <div className="min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            <p className="text-sm font-semibold text-white truncate">
              {user?.full_name || 'Guest User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'Not logged in'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover/sidebar:opacity-100"
        >
          <LogoutIcon className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
    </svg>
  );
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4L11 8l-4.5 1L5 13l-1.5-4L-1 8l4.5-1L5 3zM19 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM12 4l.8 2.2 2.2.8-2.2.8L12 10l-.8-2.2-2.2-.8 2.2-.8L12 4z" />
    </svg>
  );
}

function VideoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 7h10a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" />
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M20 8l-4 3v2l4 3V8z" />
    </svg>
  );
}

function TextIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h10M4 14h16M4 18h10" />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
      <circle cx="8.5" cy="9.5" r="1.5" strokeWidth="1.8" />
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5-5-6 6" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M10 17l-5-5m0 0l5-5m-5 5h12m-4 5v1a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h5a2 2 0 012 2v1" />
    </svg>
  );
}

