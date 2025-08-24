import React from 'react'
import { useQuery } from '@apollo/client'
import { AGENT_USERS, AGENT_ME } from '@/lib/graphql'
import { UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const Dashboard: React.FC = () => {
  const { data: agentData } = useQuery(AGENT_ME)
  const { data: usersData, loading } = useQuery(AGENT_USERS)

  // Helper function to check if user is active based on orderEndTime
  const isUserActive = (orderEndTime: string) => {
    if (!orderEndTime) return false
    const endTime = new Date(orderEndTime)
    const now = new Date()
    return endTime > now
  }

  const users = usersData?.agentUsers || []
  const activeUsers = users.filter((user: any) => isUserActive(user.orderEndTime)).length
  const expiredUsers = users.filter((user: any) => !isUserActive(user.orderEndTime)).length

  const stats = [
    {
      name: '总用户数',
      value: users.length,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: '活跃用户',
      value: activeUsers,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: '已过期用户',
      value: expiredUsers,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-2 text-gray-600">
          欢迎回来，{agentData?.agentMe?.username}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">最近用户</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {users.slice(0, 5).map((user: any) => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    创建于 {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    isUserActive(user.orderEndTime)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isUserActive(user.orderEndTime) ? '活跃' : '已过期'}
                </span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              暂无用户
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard