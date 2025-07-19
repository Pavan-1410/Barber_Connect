#!/bin/bash

echo "🚀 BarberConnect Deployment Script"
echo "=================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files to git
echo "📝 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: BarberConnect MERN application"

echo ""
echo "🎉 Local setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin https://github.com/yourusername/barberconnect.git"
echo "3. Run: git push -u origin main"
echo ""
echo "🌐 Deployment options:"
echo "• Frontend: Vercel, Netlify, or GitHub Pages"
echo "• Backend: Render, Railway, or Heroku"
echo "• Database: MongoDB Atlas"
echo ""
echo "📚 See README.md for detailed deployment instructions" 