# Quick Reference Guide

This document provides quick access to the most commonly used commands and snippets during development.

## Essential Commands

### Development
```bash
# Start development server
npm run tauri:dev

# Build for production
npm run tauri:build

# Clean build and restart
npm run clean && npm run tauri:dev

# Check Rust toolchain
rustup show

# Update dependencies
npm update
```

### Database Operations
```bash
# Open SQLite console
sqlite3 pos.db

# Common SQLite commands
.tables                    # List all tables
.schema table_name         # Show table structure  
SELECT * FROM table_name;  # View data
PRAGMA integrity_check;    # Check database integrity
.exit                      # Exit console

# Backup database
cp pos.db pos.db.backup

# Restore database
cp pos.db.backup pos.db
```

### Git Commands
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Stage and commit changes
git add .
git commit -m "feat: your feature description"

# Push branch
git push origin feature/your-feature-name

# Update main branch
git checkout main
git pull origin main
git checkout your-branch
git rebase main
```

### Rust Commands
```bash
# Check Rust installation
rustc --version
cargo --version

# Update Rust
rustup update

# Clean Rust build
cd src-tauri && cargo clean

# Run tests
cd src-tauri && cargo test

# Check for compilation issues
cd src-tauri && cargo check
```

## Common Code Snippets

### Adding a New Tauri Command

**Backend (Rust)** - Add to `src-tauri/src/main.rs`:
```rust
#[tauri::command]
async fn your_command_name(param: String) -> Result<String, String> {
    // Your logic here
    Ok("Success".to_string())
}

// Register in main():
.invoke_handler(tauri::generate_handler![
    // existing commands...
    your_command_name
])
```

**Frontend (React)** - Call from any component:
```javascript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke('your_command_name', { 
    param: 'your_value' 
});
```

### Database Operations

**Rust** - Add to `src-tauri/src/database.rs`:
```rust
pub fn your_function(conn: &Connection) -> Result<(), rusqlite::Error> {
    let query = "YOUR SQL QUERY";
    let mut stmt = conn.prepare(query)?;
    
    while let Ok(row) = stmt.next() {
        // Process row
    }
    
    Ok(())
}
```

**Frontend** - Call database function:
```javascript
import { invoke } from '@tauri-apps/api/core';

const data = await invoke('your_database_function', {
    // parameters
});
```

### React Component Template
```jsx
import React from 'react';
import './YourComponent.css';

export default function YourComponent() {
    const [state, setState] = React.useState(null);

    const handleAction = async () => {
        // Your logic
    };

    return (
        <div className="your-component">
            <h2>Component Title</h2>
            {/* Your JSX */}
        </div>
    );
}
```

### Error Handling Patterns

**Rust**:
```rust
match your_operation() {
    Ok(result) => Ok(result),
    Err(e) => {
        eprintln!("Error: {}", e);
        Err(e.to_string())
    }
}
```

**React**:
```javascript
try {
    const result = await someOperation();
    setState(result);
} catch (error) {
    console.error('Operation failed:', error);
    setError(error.message);
}
```

## Debugging

### Enable Debug Logging
```bash
# Set environment variable
export RUST_LOG=debug
npm run tauri:dev

# Or use debug flag
npm run tauri:dev -- --debug
```

### Common Debug Commands
```bash
# Check if port is in use
lsof -i :1420

# View application logs
# Check terminal output when running npm run tauri:dev

# Database inspection
sqlite3 pos.db "SELECT sql FROM sqlite_master WHERE type='table';"

# Check build artifacts
ls -la src-tauri/target/release/
```

### Frontend Debugging
```javascript
// Add to any component for debugging
console.log('Debug info:', data);

// Use React Developer Tools
// Browser DevTools F12
```

### Backend Debugging
```rust
// Add to Rust code
println!("Debug: {:?}", data);

// Or use logging
use log::info;
info!("Info message: {:?}", data);
```

## File Locations

### Important Files
- **Database**: `pos.db` (root directory)
- **Config**: `src-tauri/tauri.conf.json`
- **Frontend Entry**: `src/main.jsx`
- **Backend Entry**: `src-tauri/src/main.rs`
- **Dependencies**: `package.json` (frontend), `src-tauri/Cargo.toml` (backend)

### Log Files
- **Development**: Check terminal output
- **Production**: Check application data directory

### Build Outputs
- **Frontend**: `dist/` directory
- **Backend**: `src-tauri/target/release/`
- **Bundle**: `src-tauri/target/release/bundle/`

## Performance Tips

### Development
- Use `npm run tauri:dev` for fast iteration
- Enable hot reload for frontend changes
- Restart app for backend changes only

### Production
- Run `npm run tauri:build` for optimized builds
- Test on target platform before distribution
- Use `cargo check` instead of full build for quick checks

### Database
- Use transactions for multiple operations
- Index frequently queried columns
- Regular database backups

## Security Considerations

### Database
- Never commit `pos.db` to version control
- Use parameterized queries to prevent SQL injection
- Regular database backups

### Frontend
- Validate all user inputs
- Sanitize data before displaying
- Use HTTPS in production

### Backend
- Validate all parameters
- Use proper error handling
- Don't expose sensitive data in error messages

## Quick Environment Check

Run this to verify your setup:
```bash
#!/bin/bash
echo "=== Environment Check ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Rust: $(rustc --version)"
echo "Cargo: $(cargo --version)"
echo "Python: $(python3 --version)"
echo ""
echo "=== Project Check ==="
echo "Dependencies installed: $([ -d 'node_modules' ] && echo '✓' || echo '✗')"
echo "Database exists: $([ -f 'pos.db' ] && echo '✓' || echo '✗')"
echo "Rust build successful: $(cd src-tauri && cargo check 2>/dev/null && echo '✓' || echo '✗')"
echo ""
echo "=== Port Check ==="
echo "Port 1420 status: $(lsof -i :1420 >/dev/null 2>&1 && echo 'In Use' || echo 'Available')"
```

Save as `check-env.sh` and run:
```bash
chmod +x check-env.sh
./check-env.sh
```

## Emergency Commands

### Reset Everything
```bash
# Complete reset
git clean -fdx
npm install
cd src-tauri && cargo clean && cd ..
npm run tauri:dev
```

### Fix Common Issues
```bash
# Database corrupted
rm pos.db
npm run tauri:dev  # Will recreate database

# Build issues
rm -rf node_modules package-lock.json
npm install

# Rust issues
rustup update
cd src-tauri && cargo clean
```

### Backup Before Major Changes
```bash
# Create backup
cp -r . ../pos-system-backup-$(date +%Y%m%d-%H%M%S)

# Or just database
cp pos.db pos.db.backup.$(date +%Y%m%d)
```

---

**Bookmark this page for quick reference during development!**