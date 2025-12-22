# Environment Check Script

This directory contains an automated script to verify that your development environment is properly configured for the POS System project.

## check-environment.sh

### Purpose
The `check-environment.sh` script performs a comprehensive check of your development environment and reports any issues that need to be resolved before you can start developing the POS System.

### What It Checks

#### System Requirements
- **Operating System**: Detects Linux, macOS, or Windows
- **Available Space**: Checks for sufficient disk space (recommends 2GB+)

#### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Node package manager
- **Rust**: Version 1.70 or higher (recommended)
- **Cargo**: Rust package manager and build tool
- **Python**: Version 3.8 or higher
- **Git**: Version control system

#### Build Tools (Linux)
- **GCC**: C compiler
- **pkg-config**: Package configuration tool

#### Project Setup
- **Directory Structure**: Verifies you're in the project root
- **Dependencies**: Checks if `node_modules` exists
- **Database**: Checks if `pos.db` exists
- **Rust Compilation**: Tests if the Rust code compiles

#### Network
- **Port 1420**: Checks if the development server port is available

### Usage

```bash
# Make the script executable (if not already)
chmod +x check-environment.sh

# Run the environment check
./check-environment.sh
```

### Sample Output

```
========================================
POS System Environment Check
========================================

Operating System:
  ✓ Linux detected

Required Tools:

Node.js (v18+ required):
  ✓ Node.js v18.17.0

npm:
  ✓ npm is installed
    Version: 9.6.7

Rust (v1.70+ required):
  ✓ Rust v1.70.0

Cargo:
  ✓ cargo is installed
    Version: cargo 1.70.0

Python (3.8+ required):
  ✓ Python 3.10.6

Git:
  ✓ git is installed
    Version: git version 2.34.1

Build Essentials (Linux):
  ✓ GCC is installed
  ✓ pkg-config is installed

Project Setup:
  ✓ In project root directory
  ✓ Dependencies installed (node_modules exists)
  ✓ Database exists
    ✓ Rust code compiles successfully

Network:
  ✓ Port 1420 is available

========================================
Summary & Recommendations
========================================

✓ Environment is ready for development!
  Run 'npm run tauri:dev' to start development

Next steps:
  1. Fix any issues listed above
  2. Run: npm install
  3. Run: npm run tauri:dev

For detailed setup instructions, see: DEVELOPER_SETUP.md
For quick commands, see: QUICK_REFERENCE.md
```

### Troubleshooting Common Issues

#### Missing Node.js
```bash
# Install Node.js via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Missing Rust
```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### Missing Python
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# macOS
brew install python3

# Windows - Download from https://python.org
```

#### Build Essentials (Linux)
```bash
sudo apt install build-essential pkg-config
```

#### Dependencies Not Installed
```bash
npm install
```

#### Port 1420 In Use
```bash
# Find and kill process using the port
lsof -ti:1420 | xargs kill -9

# Or change the port in vite.config.js
```

### Exit Codes
- **0**: All checks passed, environment is ready
- **1**: One or more issues detected that need resolution

### Integration with Development Workflow

Use this script as part of your onboarding process:

1. **New Developer Onboarding**
   ```bash
   # After cloning the repository
   ./check-environment.sh
   # Fix any issues
   # Then follow DEVELOPER_SETUP.md
   ```

2. **Troubleshooting**
   ```bash
   # When experiencing build issues
   ./check-environment.sh
   # Follow the recommendations
   ```

3. **Pre-commit Checklist**
   ```bash
   # Before submitting changes
   ./check-environment.sh
   npm run tauri:build
   ```

### Customization

The script can be modified to check for additional requirements:

- **Additional Tools**: Add new tool checks following the existing pattern
- **Custom Version Requirements**: Modify version comparison logic
- **Project-Specific Checks**: Add checks for project configuration files
- **Custom Recommendations**: Update the recommendations section

### Script Architecture

The script is organized into sections:

1. **Setup**: Color definitions and utility functions
2. **System Check**: Operating system detection
3. **Tool Verification**: Individual tool checks with version validation
4. **Project Validation**: Project-specific setup verification
5. **Network Check**: Port availability testing
6. **Summary**: Issue counting and recommendations

### Limitations

- **Platform Detection**: Limited to common Unix-like systems and Windows
- **Version Checking**: Basic semantic version comparison
- **Network Check**: Relies on `lsof` which may not be available on all systems
- **Interactive**: Requires manual intervention to fix issues

### Contributing

If you encounter false positives or need additional checks:

1. **Identify the Issue**: Note which check is incorrect
2. **Propose Solution**: Suggest how the check should be improved
3. **Test Changes**: Verify the fix works across different environments
4. **Submit PR**: Include your improvements to the script

### Related Documentation

- **[DEVELOPER_SETUP.md](../DEVELOPER_SETUP.md)**: Comprehensive setup guide
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)**: Quick commands and snippets
- **[README.md](../README.md)**: Project overview and user documentation

---

**Use this script as your first step in setting up the development environment!**