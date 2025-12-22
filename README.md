# POS System

A modern Point of Sale (POS) system built with Tauri, React, and SQLite. Perfect for small retail stores that need an offline-capable, fast, and reliable POS solution.

## Features

### Core POS Functionality
- **Barcode Scanning**: Support for barcode scanners and manual barcode entry
- **Product Search**: Quick product lookup by name or barcode
- **Cart Management**: Add, remove, and modify quantities in the shopping cart
- **Payment Processing**: Support for cash, card, and mobile payments
- **Receipt Printing**: Generate and print transaction receipts

### Inventory Management
- **Product Management**: Add, edit, and delete products
- **Stock Tracking**: Real-time inventory levels with low stock alerts
- **Category Organization**: Organize products by categories
- **Stock Updates**: Quick stock adjustments

### Transaction History
- **Complete Records**: View all past transactions with details
- **Search & Filter**: Find transactions by date, payment method, or items
- **Analytics**: Revenue and sales statistics
- **Export**: Export transaction data to CSV

### Technical Features
- **Offline Operation**: Works completely offline with local SQLite database
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Small Footprint**: Built with Tauri for minimal resource usage
- **Responsive Design**: Works on different screen sizes

## Technology Stack

- **Frontend**: React 18 with modern hooks
- **Backend**: Rust with Tauri 2.0
- **Database**: SQLite with bundled support
- **Styling**: CSS with responsive design
- **Build Tool**: Vite for fast development

## Installation

### Prerequisites
- Node.js 18+ 
- Rust 1.70+
- Python 3.8+ (for building SQLite)

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   cd pos-system
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run tauri:dev
   ```

   This will:
   - Start the React development server
   - Build and launch the Tauri application
   - Watch for changes in both frontend and backend

### Building for Production

```bash
npm run tauri:build
```

This creates distributable packages for your current platform.

## Usage

### Getting Started

1. **Add Products**: Use the Inventory tab to add your products with barcodes, prices, and stock levels
2. **Start Selling**: Use the POS tab to scan products and process sales
3. **Track Performance**: View transaction history and analytics

### Basic Workflow

1. **Product Setup**
   - Navigate to Inventory Management
   - Add products with barcodes, names, prices, and stock quantities
   - Organize products into categories

2. **Point of Sale**
   - Use barcode scanner or manual entry to add products
   - Adjust quantities as needed
   - Select payment method and complete transaction
   - Print receipt for customer

3. **Inventory Management**
   - Monitor stock levels and receive low stock alerts
   - Update stock quantities as needed
   - Edit product information

4. **Reporting**
   - View transaction history
   - Analyze sales performance
   - Export data for external analysis

## Configuration

### Store Settings
- Customize store name and address in the POS interface
- These details appear on printed receipts

### Database Location
- Database file: `pos.db` (created in the application directory)
- Automatic backup recommended for important data

### Printing
- Receipts currently print to console for development
- Production printing can be integrated with system print APIs

## Development

### Project Structure
```
pos-system/
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── POSInterface.jsx
│   │   ├── InventoryManager.jsx
│   │   └── TransactionHistory.jsx
│   ├── App.jsx            # Main app component
│   └── main.jsx           # React entry point
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Main Tauri application
│   │   └── database.rs    # Database operations
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration
```

### Available Scripts
- `npm run dev` - Start React development server
- `npm run build` - Build React frontend
- `npm run preview` - Preview built frontend
- `npm run tauri` - Run Tauri CLI
- `npm run tauri:dev` - Start development with Tauri
- `npm run tauri:build` - Build for production

### Adding Features

1. **Frontend Components**: Add new React components in `src/components/`
2. **Backend Commands**: Add new Tauri commands in `src-tauri/src/main.rs`
3. **Database Operations**: Extend database functions in `src-tauri/src/database.rs`

## Troubleshooting

### Common Issues

1. **Database Errors**
   - Ensure SQLite development libraries are installed
   - Check file permissions for database creation

2. **Build Failures**
   - Update Rust: `rustup update`
   - Clear npm cache: `npm cache clean --force`
   - Rebuild: `npm run tauri:build`

3. **Port Conflicts**
   - Development server uses port 1420
   - Change in `vite.config.js` if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Tauri documentation
3. Open an issue on the project repository

---

**Note**: This is a demo application for educational purposes. For production use, consider additional features like user authentication, data backup, and enhanced security measures.