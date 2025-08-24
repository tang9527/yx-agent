import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { 
  AGENT_USERS, 
  AGENT_CREATE_USER, 
  AGENT_UPDATE_USER_STATUS,
  CreateUserInput 
} from '@/lib/graphql'
import { PlusIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import ConfirmationModal from '@/components/ConfirmationModal'

const UsersPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    userId: string
    currentStatus: number
    username: string
  }>({ isOpen: false, userId: '', currentStatus: 0, username: '' })
  
  const { data, loading, refetch } = useQuery(AGENT_USERS)
  const [createUser] = useMutation(AGENT_CREATE_USER)
  const [updateUserStatus] = useMutation(AGENT_UPDATE_USER_STATUS)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>()

  const users = data?.agentUsers || []

  const onCreateUser = async (formData: CreateUserInput) => {
    try {
      await createUser({
        variables: formData
      })
      toast.success('用户创建成功！')
      reset()
      setShowCreateForm(false)
      refetch()
    } catch (error: any) {
      toast.error(error.message || '创建用户失败')
    }
  }

  const handleStatusToggle = (userId: string, currentStatus: number, username: string) => {
    setConfirmModal({
      isOpen: true,
      userId,
      currentStatus,
      username
    })
  }

  const executeStatusToggle = async () => {
    const { userId, currentStatus, username } = confirmModal
    const newStatus = currentStatus === 1 ? 0 : 1
    
    try {
      await updateUserStatus({
        variables: { userId, status: newStatus }
      })
      toast.success(`用户 "${username}" ${newStatus === 1 ? '已激活' : '已禁用'}！`)
      refetch()
    } catch (error: any) {
      toast.error(error.message || '更新用户状态失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理您代理账户下的用户
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            添加用户
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">创建新用户</h3>
          <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <input
                  {...register('username', { 
                    required: '用户名是必填项',
                    minLength: { value: 3, message: '用户名至少需要3个字符' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入用户名"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <input
                  {...register('password', { 
                    required: '密码是必填项',
                    minLength: { value: 6, message: '密码至少需要6个字符' }
                  })}
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入密码"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  reset()
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? '创建中...' : '创建用户'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            user.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {user.status === 1 ? '活跃' : '禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleStatusToggle(user.id, user.status, user.username)}
                          className={clsx(
                            'inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                            user.status === 1
                              ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                              : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                          )}
                        >
                          {user.status === 1 ? '禁用' : '启用'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        暂无用户数据。创建您的第一个用户开始使用。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeStatusToggle}
        title="确认操作"
        message={`确定要${confirmModal.currentStatus === 1 ? '禁用' : '启用'}用户 "${confirmModal.username}" 吗？`}
        confirmText={confirmModal.currentStatus === 1 ? '禁用' : '启用'}
        cancelText="取消"
        type={confirmModal.currentStatus === 1 ? 'warning' : 'info'}
      />
    </div>
  )
}

export default UsersPage