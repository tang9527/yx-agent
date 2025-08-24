# YX Agent Dashboard

A React-based client application for agent management in the YX system. This application allows agents to manage users, view statistics, and configure their account settings.

## Features

- **Agent Authentication**: Secure login system for agents
- **User Management**: Create, view, and manage user accounts
- **User Status Control**: Enable/disable user accounts
- **Dashboard**: Overview of user statistics and recent activity
- **Settings**: Change agent password and view account information
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Apollo Client for GraphQL
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 16+
- npm or yarn
- Running YX Server (backend API)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yx-agent
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file and set your GraphQL endpoint:
```env
VITE_GRAPHQL_ENDPOINT=http://api.pdf2json.com/graphql
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main application layout
├── context/            # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utility libraries
│   ├── apollo.ts       # Apollo GraphQL client
│   └── graphql.ts      # GraphQL queries and mutations
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard page
│   ├── LoginPage.tsx   # Login page
│   ├── SettingsPage.tsx # Settings page
│   └── UsersPage.tsx   # User management page
├── App.tsx             # Main app component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## API Integration

The application integrates with the YX Server GraphQL API and provides the following functionality:

### Agent Operations
- `agentLogin` - Agent authentication
- `agentMe` - Get current agent information
- `agentChangePassword` - Change agent password
- `agentUsers` - Get list of users managed by agent
- `agentCreateUser` - Create new user
- `agentUpdateUserStatus` - Enable/disable user accounts

### Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in GraphQL requests.

## Usage

1. **Login**: Enter your agent credentials on the login page
2. **Dashboard**: View user statistics and recent activity
3. **Users**: Manage user accounts - create new users and toggle their status
4. **Settings**: Change your password and view account information

## User Status

- **Active (1)**: User can access the system
- **Disabled (0)**: User access is disabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.