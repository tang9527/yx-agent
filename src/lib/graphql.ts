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
  query AgentUsers {
    agentUsers {
      id
      username
      status
      agentId
      createdAt
    }
  }
`

// User Management
export const AGENT_CREATE_USER = gql`
  mutation AgentCreateUser($username: String!, $password: String!) {
    agentCreateUser(username: $username, password: $password) {
      id
      username
      status
      agentId
      createdAt
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
}

export interface UpdateUserStatusInput {
  userId: string
  status: number
}