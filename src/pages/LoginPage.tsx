import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AgentLoginInput } from '@/lib/graphql'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgentLoginInput>()

  const onSubmit = async (data: AgentLoginInput) => {
    console.log('🔵 LoginPage: Starting login process...')
    try {
      const success = await login(data)
      console.log('🔵 LoginPage: Login result:', success)
      if (success) {
        console.log('🔵 LoginPage: Login successful, preparing to navigate...')
        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('🔵 LoginPage: Executing navigation to dashboard...')
          navigate('/', { replace: true })
          console.log('🔵 LoginPage: Navigation command executed')
        }, 100)
      } else {
        console.log('🔴 LoginPage: Login failed')
      }
    } catch (error) {
      console.error('🔴 LoginPage: Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            代理登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            登录您的代理账户
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="请输入密码"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage