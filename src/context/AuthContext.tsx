import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { AGENT_LOGIN, AGENT_ME, Agent, AgentLoginInput } from '@/lib/graphql'
import toast from 'react-hot-toast'

interface AuthContextType {
  agent: Agent | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: AgentLoginInput) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [agentLogin] = useMutation(AGENT_LOGIN)
  
  const hasToken = !!localStorage.getItem('agent_token')
  const { data, loading, refetch } = useQuery(AGENT_ME, {
    skip: !hasToken,
    errorPolicy: 'ignore'
  })

  // Initialize authentication state on mount
  useEffect(() => {
    const token = localStorage.getItem('agent_token')
    console.log('🔵 AuthContext: Initializing with token:', !!token)
    if (token && !isInitialized) {
      // If we have a token, assume authenticated until proven otherwise
      console.log('🔵 AuthContext: Setting initial authenticated state to true')
      setIsAuthenticated(true)
    }
    setIsInitialized(true)
    console.log('🔵 AuthContext: Initialization complete')
  }, [])

  useEffect(() => {
    console.log('🔵 AuthContext: User data effect triggered. Data:', !!data?.agentMe, 'Loading:', loading, 'HasToken:', hasToken)
    if (data?.agentMe) {
      console.log('🔵 AuthContext: Setting user data and authenticated state')
      setAgent(data.agentMe)
      setIsAuthenticated(true)
    }
    // Remove the automatic token clearing logic - let the server respond with proper errors
    // The token might be valid but the user data fetch could fail for other reasons
  }, [data, isInitialized, hasToken, loading])

  const login = async (credentials: AgentLoginInput): Promise<boolean> => {
    console.log('🔵 AuthContext: Login attempt started')
    try {
      const { data } = await agentLogin({
        variables: credentials
      })

      console.log('🔵 AuthContext: Login mutation result:', !!data?.agentLogin)
      if (data?.agentLogin) {
        console.log('🔵 AuthContext: Storing token and updating state')
        localStorage.setItem('agent_token', data.agentLogin)
        // Update authentication state immediately
        setIsAuthenticated(true)
        console.log('🔵 AuthContext: Authentication state set to true')
        
        // Try to refetch user data, but don't fail the login if this fails
        try {
          const { data: userData } = await refetch()
          console.log('🔵 AuthContext: Refetch result:', !!userData?.agentMe)
          if (userData?.agentMe) {
            setAgent(userData.agentMe)
            console.log('🔵 AuthContext: User agent data set')
          }
        } catch (refetchError) {
          console.log('🟡 AuthContext: Refetch failed, but login was successful:', refetchError)
          // Don't fail the login just because refetch failed
        }
        
        toast.success('登录成功！')
        console.log('🔵 AuthContext: Login process completed successfully')
        return true
      }
      console.log('🔴 AuthContext: No login token received')
      return false
    } catch (error: any) {
      console.error('🔴 AuthContext: Login error:', error)
      toast.error(error.message || '登录失败')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('agent_token')
    setAgent(null)
    setIsAuthenticated(false)
    toast.success('退出登录成功')
  }

  return (
    <AuthContext.Provider
      value={{
        agent,
        isAuthenticated,
        isLoading: loading || !isInitialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}