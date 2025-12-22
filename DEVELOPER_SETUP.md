# Developer Setup Guide

This guide will help new developers set up their development environment for the POS System project.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Common Development Tasks](#common-development-tasks)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing Guidelines](#contributing-guidelines)

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 2GB free space

### Required Software

#### 1. Node.js (v18 or higher)
```bash
# Check if Node.js is installed
node --version

# If not installed, download from https://nodejs.org/
# Or using a version manager:

# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 2. Rust (v1.70 or higher)
```bash
# Check if Rust is installed
rustc --version

# If not installed, install via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Update to latest version
rustup update
```

#### 3. Python (3.8 or higher) - For SQLite development
```bash
# Check Python version
python3 --version

# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# macOS (using Homebrew)
brew install python3

# Windows - Download from https://python.org
```

#### 4. Git
```bash
# Check Git installation
git --version

# Install if needed:
# Ubuntu/Debian: sudo apt install git
# macOS: brew install git
# Windows: Download from https://git-scm.com/
```

#### 5. Build Essentials (Linux)
```bash
# Ubuntu/Debian
sudo apt install build-essential libssl-dev pkg-config

# For SQLite development
sudo apt install libsqlite3-dev
```

### Optional but Recommended Tools

#### Code Editor
- **VS Code** (recommended) with extensions:
  - Rust Analyzer
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - GitLens

#### Database Tools
- **DB Browser for SQLite** - For database inspection
- **sqlite3 CLI** - For command-line database operations

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pos-system
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# This will also install Tauri CLI and other frontend dependencies
```

### 3. Verify Installation
```bash
# Check if all tools are properly installed
node --version    # Should show v18+
npm --version     # Should show 9+
rustc --version   # Should show 1.70+
cargo --version   # Should show 1.70+
python3 --version # Should show 3.8+
```

## Project Setup

### 1. Environment Configuration
Create a `.env` file in the root directory (optional):
```bash
# .env
VITE_APP_TITLE=POS System
VITE_DEV_SERVER_PORT=1420
```

### 2. Database Setup
The SQLite database will be automatically created when the application first runs. Database location:
- **Development**: `pos.db` in the project root
- **Production**: Application data directory

### 3. Initial Build
```bash
# Build the frontend for development
npm run build

# Verify Tauri setup
npm run tauri --version
```

### 4. First Run
```bash
# Start development server
npm run tauri:dev

# This will:
# 1. Start the Vite development server (port 1420)
# 2. Build and launch the Tauri application
# 3. Enable hot reloading for both frontend and backend
```

## Development Workflow

### Starting Development
```bash
# Start the development environment
npm run tauri:dev

# The application will open automatically
# Hot reloading is enabled for both frontend and backend
```

### Making Changes

#### Frontend Changes (React/Vite)
- Edit files in `src/` directory
- Changes are automatically reflected (hot reload)
- No build step required

#### Backend Changes (Rust/Tauri)
- Edit files in `src-tauri/src/` directory
- Changes require app restart
- Use `npm run tauri:dev` to restart

#### Configuration Changes
- Frontend config: `vite.config.js`
- Tauri config: `src-tauri/tauri.conf.json`
- Package config: `package.json`

### Building for Production
```bash
# Build the complete application
npm run tauri:build

# Output will be in:
# - macOS: src-tauri/target/release/bundle/
# - Windows: src-tauri/target/release/bundle/
# - Linux: src-tauri/target/release/bundle/
```

## Project Structure

```
pos-system/
├── README.md                     # User documentation
├── DEVELOPER_SETUP.md           # This file
├── package.json                 # Node.js dependencies
├── vite.config.js              # Vite configuration
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML template
├── pos.db                      # SQLite database (created on first run)
│
├── src/                        # Frontend (React)
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   ├── index.css               # Base styles
│   │
│   ├── components/             # React components
│   │   ├── POSInterface.jsx    # Main POS interface
│   │   ├── InventoryManager.jsx # Product management
│   │   ├── TransactionHistory.jsx # Sales history
│   │   │
│   │   └── auth/               # Authentication components
│   │       ├── Login.jsx       # Login form
│   │       └── UserManagement.jsx # User admin
│   │
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx     # Authentication state
│   │
│   └── lib/                    # Utility libraries
│
└── src-tauri/                  # Backend (Rust)
    ├── Cargo.toml              # Rust dependencies
    ├── tauri.conf.json         # Tauri configuration
    ├── build.rs               # Build script
    │
    ├── src/                   # Rust source code
    │   ├── main.rs            # Main application entry
    │   └── database.rs        # Database operations
    │
    ├── icons/                 # Application icons
    │   ├── 32x32.png
    │   ├── 128x128.png
    │   └── 128x128@2x.png
    │
    └── gen/                   # Generated files (auto-created)
        └── schemas/           # Tauri API schemas
```

### Key Files

#### Frontend Files
- `src/App.jsx` - Main application component
- `src/main.jsx` - React entry point
- `vite.config.js` - Build configuration
- `src/components/` - All React components

#### Backend Files
- `src-tauri/src/main.rs` - Main Rust application
- `src-tauri/src/database.rs` - Database operations
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri configuration

#### Configuration Files
- `package.json` - Node.js dependencies and scripts
- `.gitignore` - Git ignore patterns
- `index.html` - HTML template

## Common Development Tasks

### Adding a New Component
1. Create component file in `src/components/`
2. Export the component
3. Import and use in parent component
4. Add CSS styles (optional)

Example:
```jsx
// src/components/NewComponent.jsx
import React from 'react';
import './NewComponent.css';

export default function NewComponent() {
  return (
    <div className="new-component">
      <h2>New Component</h2>
    </div>
  );
}
```

### Adding a New Tauri Command
1. Add command to `src-tauri/src/main.rs`
2. Register the command in `main()` function
3. Call from frontend using `@tauri-apps/api`

Example:
```rust
// src-tauri/src/main.rs
#[tauri::command]
async fn my_new_command(data: String) -> Result<String, String> {
    // Command implementation
    Ok(format!("Processed: {}", data))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // existing commands...
            my_new_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Database Operations
1. Functions are in `src-tauri/src/database.rs`
2. Use `rusqlite` for database operations
3. Create migrations for schema changes

Example:
```rust
// src-tauri/src/database.rs
pub fn create_table(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS new_table (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );"
    )?;
    Ok(())
}
```

### Working with SQLite Database
```bash
# Open database console
sqlite3 pos.db

# Useful commands
.tables                    # List all tables
.schema table_name         # Show table structure
SELECT * FROM table_name;  # View data
.exit                      # Exit console
```

## Testing

### Frontend Testing
```bash
# Run frontend tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

### Backend Testing
```bash
# Run Rust tests
cd src-tauri && cargo test

# Run with output
cd src-tauri && cargo test -- --nocapture
```

### Integration Testing
```bash
# Full application testing
npm run tauri:dev &
# Test the application manually
```

### Testing Database Changes
```bash
# Backup database before testing schema changes
cp pos.db pos.db.backup

# Test changes
npm run tauri:dev

# Verify database integrity
sqlite3 pos.db "PRAGMA integrity_check;"

# Restore if needed
cp pos.db.backup pos.db
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear all caches and rebuild
npm run clean
npm install
cd src-tauri && cargo clean
cd .. && npm run tauri:build
```

#### 2. Database Errors
```bash
# Ensure SQLite development libraries are installed
# Ubuntu/Debian:
sudo apt install libsqlite3-dev

# Check database permissions
ls -la pos.db
chmod 664 pos.db
```

#### 3. Port Conflicts
```bash
# Check if port 1420 is in use
lsof -i :1420

# Change port in vite.config.js if needed
```

#### 4. Rust Compilation Errors
```bash
# Update Rust toolchain
rustup update

# Clear Rust cache
cargo clean

# Check for missing dependencies
cargo check
```

#### 5. Node.js/npm Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Enable debug logging
npm run tauri:dev -- --debug

# Or set environment variable
export RUST_LOG=debug
npm run tauri:dev
```

### Database Inspection
```bash
# Use DB Browser for SQLite to inspect the database
# Or use command line:
sqlite3 pos.db ".tables"
sqlite3 pos.db "SELECT sql FROM sqlite_master WHERE type='table';"
```

## Contributing Guidelines

### Development Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test Changes**
   ```bash
   npm run tauri:dev  # Test locally
   npm run tauri:build # Ensure production build works
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

#### Frontend (React/JavaScript)
- Use functional components with hooks
- Follow React best practices
- Use meaningful component names
- Add PropTypes or TypeScript (if implemented)

#### Backend (Rust)
- Follow Rust naming conventions
- Use proper error handling
- Add documentation comments
- Write unit tests

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/config changes

Example:
```
feat(auth): add user logout functionality

- Implement logout endpoint in database.rs
- Add logout button to Login component
- Update AuthContext to handle logout state

Closes #123
```

### Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors in development
- [ ] Production build successful
- [ ] Database migrations tested

### Getting Help
1. Check this documentation first
2. Review existing issues on GitHub
3. Ask in project discussions
4. Contact maintainers

### Release Process
1. Update version in `package.json` and `Cargo.toml`
2. Update `CHANGELOG.md`
3. Create release PR
4. Tag release after merge

---

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [Rust Documentation](https://www.rust-lang.org/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Vite Documentation](https://vitejs.dev/)

---

**Happy Coding! 🚀**