#!/bin/bash

# ClickSprout v1.0 - GitHub Connection Script
# Replace YOURUSERNAME with your actual GitHub username
# Replace REPOSITORYNAME with your chosen repository name

echo "🚀 Connecting ClickSprout v1.0 to GitHub..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the ClickSprout project directory"
    echo "Please navigate to your ClickSprout v1.0 folder first"
    exit 1
fi

# Variables - UPDATE THESE WITH YOUR DETAILS
GITHUB_USERNAME="YOURUSERNAME"  # Replace with your GitHub username
REPO_NAME="clicksprout-v1"      # Replace with your repository name

echo "📁 Current directory: $(pwd)"
echo "👤 GitHub username: $GITHUB_USERNAME"
echo "📦 Repository name: $REPO_NAME"

# Add remote origin
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully connected to GitHub!"
echo "🌐 Your repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "🚀 Ready for deployment to Vercel!"

# Instructions for Vercel deployment
echo ""
echo "🚀 Next Steps for Vercel Deployment:"
echo "1. Go to https://vercel.com"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository"
echo "4. Configure environment variables"
echo "5. Deploy!"
