#!/bin/bash

# POS System Environment Check Script
# This script checks if all required tools are properly installed

set -e

echo "========================================"
echo "POS System Environment Check"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version
check_version() {
    local cmd=$1
    local min_version=$2
    local check_cmd=$3
    
    if command_exists "$cmd"; then
        local version=$($check_cmd 2>/dev/null | head -n1)
        echo -e "  ${GREEN}✓${NC} $cmd is installed"
        echo -e "    Version: $version"
        return 0
    else
        echo -e "  ${RED}✗${NC} $cmd is not installed"
        return 1
    fi
}

# Check operating system
echo "Operating System:"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "  ${GREEN}✓${NC} Linux detected"
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "  ${GREEN}✓${NC} macOS detected"
    OS="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo -e "  ${GREEN}✓${NC} Windows detected"
    OS="windows"
else
    echo -e "  ${YELLOW}?${NC} Unknown OS: $OSTYPE"
    OS="unknown"
fi
echo ""

# Check required tools
echo "Required Tools:"
echo ""

# Node.js
echo "Node.js (v18+ required):"
if command_exists node; then
    node_version=$(node --version | sed 's/v//')
    node_major=$(echo $node_version | cut -d. -f1)
    if [ "$node_major" -ge 18 ]; then
        echo -e "  ${GREEN}✓${NC} Node.js v$node_version"
    else
        echo -e "  ${RED}✗${NC} Node.js v$node_version (v18+ required)"
    fi
else
    echo -e "  ${RED}✗${NC} Node.js is not installed"
fi
echo ""

# npm
echo "npm:"
check_version "npm" "" "npm --version"
echo ""

# Rust
echo "Rust (v1.70+ required):"
if command_exists rustc; then
    rust_version=$(rustc --version | cut -d' ' -f2)
    rust_major=$(echo $rust_version | cut -d'.' -f1)
    rust_minor=$(echo $rust_version | cut -d'.' -f2)
    if [ "$rust_major" -eq 1 ] && [ "$rust_minor" -ge 70 ]; then
        echo -e "  ${GREEN}✓${NC} Rust v$rust_version"
    else
        echo -e "  ${YELLOW}!${NC} Rust v$rust_version (v1.70+ recommended)"
    fi
else
    echo -e "  ${RED}✗${NC} Rust is not installed"
fi
echo ""

# Cargo
echo "Cargo:"
check_version "cargo" "" "cargo --version"
echo ""

# Python
echo "Python (3.8+ required):"
if command_exists python3; then
    python_version=$(python3 --version | cut -d' ' -f2)
    python_major=$(echo $python_version | cut -d'.' -f1)
    python_minor=$(echo $python_version | cut -d'.' -f2)
    if [ "$python_major" -eq 3 ] && [ "$python_minor" -ge 8 ]; then
        echo -e "  ${GREEN}✓${NC} Python $python_version"
    else
        echo -e "  ${YELLOW}!${NC} Python $python_version (3.8+ required)"
    fi
else
    echo -e "  ${RED}✗${NC} Python 3 is not installed"
fi
echo ""

# Git
echo "Git:"
check_version "git" "" "git --version"
echo ""

# Check build essentials (Linux only)
if [ "$OS" = "linux" ]; then
    echo "Build Essentials (Linux):"
    if command_exists gcc; then
        echo -e "  ${GREEN}✓${NC} GCC is installed"
    else
        echo -e "  ${RED}✗${NC} GCC is not installed (run: sudo apt install build-essential)"
    fi
    
    if command_exists pkg-config; then
        echo -e "  ${GREEN}✓${NC} pkg-config is installed"
    else
        echo -e "  ${RED}✗${NC} pkg-config is not installed (run: sudo apt install pkg-config)"
    fi
    echo ""
fi

# Check project setup
echo "Project Setup:"
echo ""

# Check if we're in the right directory
if [ -f "package.json" ] && [ -d "src-tauri" ]; then
    echo -e "  ${GREEN}✓${NC} In project root directory"
else
    echo -e "  ${RED}✗${NC} Not in project root directory"
    echo -e "    Expected files: package.json, src-tauri/"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} Dependencies installed (node_modules exists)"
else
    echo -e "  ${YELLOW}!${NC} Dependencies not installed (run: npm install)"
fi

# Check if database exists
if [ -f "pos.db" ]; then
    echo -e "  ${GREEN}✓${NC} Database exists"
else
    echo -e "  ${YELLOW}!${NC} Database will be created on first run"
fi

# Check Rust compilation
if command_exists cargo && [ -d "src-tauri" ]; then
    echo "  Checking Rust compilation..."
    cd src-tauri
    if cargo check >/dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} Rust code compiles successfully"
    else
        echo -e "    ${RED}✗${NC} Rust compilation errors detected"
    fi
    cd ..
else
    echo -e "  ${YELLOW}!${NC} Cannot check Rust compilation"
fi
echo ""

# Check ports
echo "Network:"
echo "  Port 1420 (development server):"
if command_exists lsof; then
    if lsof -i :1420 >/dev/null 2>&1; then
        echo -e "    ${YELLOW}!${NC} Port 1420 is in use"
    else
        echo -e "    ${GREEN}✓${NC} Port 1420 is available"
    fi
else
    echo -e "    ${YELLOW}?${NC} Cannot check port (lsof not available)"
fi
echo ""

# Summary and recommendations
echo "========================================"
echo "Summary & Recommendations"
echo "========================================"
echo ""

# Count issues
issues=0

# Check each requirement
if ! command_exists node; then
    echo -e "${RED}• Install Node.js v18+ from https://nodejs.org/${NC}"
    issues=$((issues + 1))
fi

if ! command_exists rustc; then
    echo -e "${RED}• Install Rust from https://rustup.rs/${NC}"
    issues=$((issues + 1))
fi

if ! command_exists python3; then
    echo -e "${RED}• Install Python 3.8+ from https://python.org/${NC}"
    issues=$((issues + 1))
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}• Run: npm install${NC}"
    issues=$((issues + 1))
fi

if [ "$OS" = "linux" ] && ! command_exists gcc; then
    echo -e "${RED}• Install build essentials: sudo apt install build-essential${NC}"
    issues=$((issues + 1))
fi

echo ""
if [ $issues -eq 0 ]; then
    echo -e "${GREEN}✓ Environment is ready for development!${NC}"
    echo -e "${GREEN}  Run 'npm run tauri:dev' to start development${NC}"
else
    echo -e "${YELLOW}! $issues issue(s) need to be resolved${NC}"
    echo -e "${YELLOW}  Fix the issues above, then run this script again${NC}"
fi

echo ""
echo "Next steps:"
echo "  1. Fix any issues listed above"
echo "  2. Run: npm install"
echo "  3. Run: npm run tauri:dev"
echo ""
echo "For detailed setup instructions, see: DEVELOPER_SETUP.md"
echo "For quick commands, see: QUICK_REFERENCE.md"
echo ""
