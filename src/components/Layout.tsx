import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  UserGroupIcon, 
  HomeIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: '仪表盘', href: '/', icon: HomeIcon },
  { name: '用户管理', href: '/users', icon: UserGroupIcon },
  { name: '设置', href: '/settings', icon: CogIcon },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { agent, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center h-16 px-4 bg-gray-900">
          <h1 className="text-white text-xl font-semibold">YX Agent</h1>
        </div>
        
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isCurrent = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  isCurrent
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={clsx(
                    isCurrent
                      ? 'text-gray-300'
                      : 'text-gray-400 group-hover:text-gray-300',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info and logout */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {agent?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{agent?.username}</p>
              <p className="text-xs text-gray-400">代理</p>
            </div>
            <button
              onClick={logout}
              className="ml-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout