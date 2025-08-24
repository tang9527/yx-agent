import { gql } from '@apollo/client'

// Agent Authentication
export const AGENT_LOGIN = gql`
  mutation AgentLogin($username: String!, $password: String!) {
    agentLogin(username: $username, password: $password)
  }
`

export const AGENT_CHANGE_PASSWORD = gql`
  mutation AgentChangePassword($currentPassword: String!, $newPassword: String!) {
    agentChangePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`

// Agent Queries
export const AGENT_ME = gql`
  query AgentMe {
    agentMe {
      id
      username
      createdAt
    }
  }
`

export const AGENT_USERS = gql`
  query AgentUsers($filter: UserFilter) {
    agentUsers(filter: $filter) {
      id
      username
      status
      agentId
      createdAt
      orderEndTime
      wx
    }
  }
`

// User Management
export const AGENT_CREATE_USER = gql`
  mutation AgentCreateUser($username: String!, $password: String!, $wx: String) {
    agentCreateUser(username: $username, password: $password, wx: $wx) {
      id
      username
      status
      agentId
      createdAt
      orderEndTime
      wx
    }
  }
`

export const AGENT_UPDATE_USER_STATUS = gql`
  mutation AgentUpdateUserStatus($userId: String!, $status: Int!) {
    agentUpdateUserStatus(userId: $userId, status: $status) {
      id
      username
      status
      agentId
      createdAt
      orderEndTime
      wx
    }
  }
`

export const AGENT_UPDATE_USER_ORDER_END_TIME = gql`
  mutation AgentUpdateUserOrderEndTime($userId: String!, $orderEndTime: String!) {
    agentUpdateUserOrderEndTime(userId: $userId, orderEndTime: $orderEndTime) {
      id
      username
      status
      agentId
      createdAt
      orderEndTime
      wx
    }
  }
`

export const AGENT_UPDATE_USER_PASSWORD = gql`
  mutation AgentUpdateUserPassword($userId: String!, $newPassword: String!) {
    agentUpdateUserPassword(userId: $userId, newPassword: $newPassword) {
      id
      username
      status
      agentId
      createdAt
      orderEndTime
      wx
    }
  }
`

export const AGENT_UPDATE_USER_BASIC_INFO = gql`
  mutation AgentUpdateUserBasicInfo($userId: String!, $wx: String!, $username: String!) {
    agentUpdateUserBasicInfo(userId: $userId, wx: $wx, username: $username) {
      id
      username
      status
      agentId
      createdAt
      orderEndTime
      wx
    }
  }
`

// Type definitions
export interface Agent {
  id: string
  username: string
  createdAt: string
}

export interface User {
  id: string
  username: string
  status: number
  agent_id: string
  createdAt: string
  orderEndTime: string
  wx: string
}

export interface AgentLoginInput {
  username: string
  password: string
}

export interface AgentChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface CreateUserInput {
  username: string
  password: string
  wx?: string
}

export interface UpdateUserStatusInput {
  userId: string
  status: number
}

export interface UpdateUserOrderEndTimeInput {
  userId: string
  orderEndTime: string
}

export interface UpdateUserPasswordInput {
  userId: string
  newPassword: string
}

export interface UpdateUserBasicInfoInput {
  userId: string
  wx: string
  phone: string
}

// Filter definitions
export interface UserFilter {
  expirationStatus?: 'expired' | 'not_expired' | 'all'
  search?: string
  expiringInDays?: number
}