import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { AGENT_CHANGE_PASSWORD, AgentChangePasswordInput } from '@/lib/graphql'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const SettingsPage: React.FC = () => {
  const { agent } = useAuth()
  const [changePassword] = useMutation(AGENT_CHANGE_PASSWORD)
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AgentChangePasswordInput & { confirmPassword: string }>()

  const newPassword = watch('newPassword')

  const onChangePassword = async (data: AgentChangePasswordInput) => {
    try {
      await changePassword({
        variables: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }
      })
      toast.success('密码修改成功！')
      reset()
    } catch (error: any) {
      toast.error(error.message || '修改密码失败')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="mt-2 text-gray-600">
          管理您的代理账户设置
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Agent Information */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">代理信息</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">用户名</dt>
                <dd className="mt-1 text-sm text-gray-900">{agent?.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">代理ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{agent?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {agent?.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">修改密码</h2>
            <p className="mt-1 text-sm text-gray-500">
              更新您的密码以保证账户安全
            </p>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  当前密码
                </label>
                <input
                  {...register('currentPassword', { 
                    required: '当前密码是必填项'
                  })}
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入当前密码"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <input
                  {...register('newPassword', { 
                    required: '新密码是必填项',
                    minLength: { value: 6, message: '密码至少需要6个字符' }
                  })}
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入新密码"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <input
                  {...register('confirmPassword', { 
                    required: '请确认您的新密码',
                    validate: value => value === newPassword || '密码不匹配'
                  })}
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请确认新密码"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? '修改中...' : '修改密码'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage