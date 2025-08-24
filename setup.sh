#!/bin/bash

# YX Agent Client Setup Script

echo "🚀 Setting up YX Agent Client..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# YX Agent Client Configuration
VITE_GRAPHQL_ENDPOINT=http://api.pdf2json.com/graphql
VITE_APP_NAME=YX Agent Dashboard
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure the YX Server is running on http://api.pdf2json.com"
echo "2. Create a test agent in the database (see yx-server documentation)"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 The application will be available at http://localhost:3000"