#!/bin/bash
# Firebase deployment script for DevSecureX Frontend
# This script helps prepare and deploy the frontend to Firebase Hosting

set -e  # Exit on any error

echo "🔥 DevSecureX Frontend - Firebase Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Firebase configuration missing."
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
    if [ $? -ne 0 ]; then
        print_error "Failed to install Firebase CLI"
        exit 1
    fi
    print_success "Firebase CLI installed successfully!"
fi

print_success "All prerequisites are installed!"

# Environment selection
echo ""
print_status "Environment Selection"
echo "===================="
echo "1) Production (default)"
echo "2) Development"
echo ""
read -p "Select environment (1-2) [1]: " -n 1 -r
echo

case $REPLY in
    2|dev|development)
        ENV="development"
        ENV_FILE=".env"
        ;;
    *)
        ENV="production"
        ENV_FILE=".env.production"
        ;;
esac

print_status "Selected environment: $ENV"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "$ENV_FILE not found. Using default environment variables."
else
    print_success "Using environment file: $ENV_FILE"
fi

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_success "Dependencies installed successfully!"
fi

# Run linting
print_status "Running linting checks..."
npm run lint:check
if [ $? -ne 0 ]; then
    print_warning "Linting issues found. Do you want to continue?"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Run type checking
print_status "Running type checks..."
npm run typecheck
if [ $? -ne 0 ]; then
    print_error "Type checking failed! Please fix TypeScript errors."
    exit 1
fi

print_success "Pre-deployment checks passed!"

# Build the application
print_status "Building application for $ENV environment..."

case $ENV in
    "development")
        npm run build
        ;;
    *)
        npm run build:prod
        ;;
esac

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed successfully!"

# Firebase login check
print_status "Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    print_status "Not logged in to Firebase. Logging in..."
    firebase login
    if [ $? -ne 0 ]; then
        print_error "Firebase login failed"
        exit 1
    fi
fi

print_success "Firebase authentication verified!"

# Project selection
print_status "Firebase project configuration..."

# Check if .firebaserc exists and has project configured
if [ -f ".firebaserc" ]; then
    CURRENT_PROJECT=$(firebase use | grep "currently using" | awk '{print $4}' | sed 's/[()]//g')
    if [ ! -z "$CURRENT_PROJECT" ]; then
        print_status "Current Firebase project: $CURRENT_PROJECT"
        read -p "Use this project? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            PROJECT_ID="$CURRENT_PROJECT"
        fi
    fi
fi

if [ -z "$PROJECT_ID" ]; then
    print_status "Available Firebase projects:"
    firebase projects:list
    echo ""
    read -p "Enter your Firebase project ID: " PROJECT_ID
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "Project ID cannot be empty"
        exit 1
    fi
    
    # Set the project
    firebase use "$PROJECT_ID"
    if [ $? -ne 0 ]; then
        print_error "Failed to set Firebase project"
        exit 1
    fi
fi

print_success "Using Firebase project: $PROJECT_ID"

# Environment variable validation
print_status "Environment Variables Check"
echo "==========================="
echo ""
echo "🔍 Checking critical environment variables:"

# Check if .env file has required variables
if [ -f "$ENV_FILE" ]; then
    if grep -q "VITE_API_BASE_URL=https://your-render-service" "$ENV_FILE"; then
        print_warning "VITE_API_BASE_URL still contains placeholder value"
        echo "Please update $ENV_FILE with your actual Render backend URL"
        echo "Example: VITE_API_BASE_URL=https://devsecurex-backend.onrender.com"
        echo ""
        read -p "Have you updated the API URL? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Please update the API URL first"
            exit 1
        fi
    fi
fi

print_success "Environment variables check completed!"

# Deploy to Firebase
print_status "Deploying to Firebase Hosting..."

firebase deploy --only hosting

if [ $? -ne 0 ]; then
    print_error "Firebase deployment failed!"
    exit 1
fi

print_success "Deployment completed successfully! 🎉"

# Get the hosting URL
HOSTING_URL=$(firebase hosting:sites:list | grep -v "Site ID" | awk '{print $2}' | head -n 1)
if [ ! -z "$HOSTING_URL" ]; then
    echo ""
    echo "🌐 Your application is now live at:"
    echo "   https://$HOSTING_URL"
    echo ""
fi

# Post-deployment verification
print_status "Post-deployment verification..."
echo "==============================="
echo ""
echo "✅ Manual checks to perform:"
echo ""
echo "1. Visit your deployed application and verify it loads correctly"
echo "2. Test user authentication (GitHub/Google OAuth)"
echo "3. Verify API connectivity to your Render backend"
echo "4. Test core functionality like repository scanning"
echo "5. Check browser console for any errors"
echo ""
echo "🔧 If you encounter issues:"
echo "• Check Firebase Hosting logs: firebase hosting:logs"
echo "• Verify CORS settings in your backend"
echo "• Ensure all environment variables are set correctly"
echo "• Check network requests in browser dev tools"
echo ""

print_success "Firebase deployment script completed! 🚀"