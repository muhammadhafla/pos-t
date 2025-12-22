# Detailed Development Plan: Cash Management & Shift Reporting System

## Phase 1: Database & Backend Foundation (3-4 days)

### 1.1 Database Schema Enhancement
**New Tables to Add:**
```sql
-- Users & Authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'kasir', -- admin, manager, kasir
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT NOT NULL,
    last_login TEXT
);

-- Cash Management
CREATE TABLE cash_registers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE cash_shifts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    cash_register_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    initial_cash REAL NOT NULL DEFAULT 0,
    expected_cash REAL DEFAULT 0,
    actual_cash REAL,
    difference REAL,
    status TEXT DEFAULT 'open', -- open, closed, suspended
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers (id)
);

CREATE TABLE cash_movements (
    id TEXT PRIMARY KEY,
    shift_id TEXT NOT NULL,
    transaction_id TEXT,
    type TEXT NOT NULL, -- sale, cash_in, cash_out, adjustment
    amount REAL NOT NULL,
    reason TEXT,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES cash_shifts (id),
    FOREIGN KEY (transaction_id) REFERENCES transactions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Receipt & Printer Management
CREATE TABLE receipt_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    layout_config TEXT NOT NULL, -- JSON
    is_default BOOLEAN DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE TABLE printer_settings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- receipt, report
    connection_type TEXT NOT NULL, -- usb, network
    config TEXT NOT NULL, -- JSON config
    is_default BOOLEAN DEFAULT 0
);

-- Shift Reports
CREATE TABLE shift_reports (
    id TEXT PRIMARY KEY,
    shift_id TEXT NOT NULL,
    report_type TEXT NOT NULL, -- summary, detailed
    data TEXT NOT NULL, -- JSON report data
    pdf_path TEXT, -- Path to generated PDF
    generated_at TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES cash_shifts (id),
    FOREIGN KEY (generated_by) REFERENCES users (id)
);
```

### 1.2 Backend API Extensions
**New Tauri Commands:**
- `authenticate_user(username, password)` - User login
- `create_user(user_data)` - Add new user
- `get_users()` - List all users
- `open_cash_shift(user_id, initial_cash)` - Start new shift
- `close_cash_shift(shift_id, actual_cash)` - End shift
- `add_cash_movement(shift_id, type, amount, reason)` - Record cash movement
- `get_shift_movements(shift_id)` - Get cash movement history
- `generate_shift_report(shift_id, type)` - Generate report data
- `save_receipt_template(template_data)` - Save receipt layout
- `print_receipt(transaction_id, template_id)` - Print to POS58
- `generate_pdf_report(report_data)` - Generate A4 PDF

## Phase 2: Authentication & User Management (2-3 days)

### 2.1 User Authentication System
**Features:**
- Login screen with username/password
- Session management
- Role-based access control
- Password hashing with bcrypt

**Components to Create:**
- `Login.jsx` - Login form component
- `UserManagement.jsx` - Admin user management
- `UserContext.jsx` - React context for auth state

### 2.2 Cashier Shift Management
**Features:**
- Open/close shifts
- Shift handover between cashiers
- Real-time cash balance tracking
- Shift status monitoring

## Phase 3: POS58 Printer Integration (2-3 days)

### 3.1 ESC/POS Command Implementation
**Rust Functions:**
```rust
// POS58 specific ESC/POS commands
pub struct POS58Printer {
    connection: Box<dyn PrinterConnection>,
}

impl POS58Printer {
    pub fn new_usb_printer() -> Result<Self> {
        // Initialize USB connection to POS58
    }
    
    pub fn print_receipt(&self, receipt_data: &ReceiptData) -> Result<()> {
        // Format and print receipt
    }
    
    pub fn open_cash_drawer(&self) -> Result<()> {
        // Send cash drawer command
    }
    
    pub fn cut_paper(&self) -> Result<()> {
        // Cut paper command
    }
}
```

**Key ESC/POS Commands:**
- Initialize printer: `[0x1B, 0x40]`
- Center text: `[0x1B, 0x61, 0x01]`
- Bold text: `[0x1B, 0x45, 0x01]`
- Cut paper: `[0x1D, 0x56, 0x41, 0x10]`
- Open cash drawer: `[0x1B, 0x70, 0x00, 0x19, 0xFA]`

### 3.2 Receipt Template System
**JSON Configuration:**
```json
{
  "header": {
    "show_logo": true,
    "logo_path": "/assets/logo.png",
    "show_store_name": true,
    "show_address": true,
    "show_phone": true,
    "show_tax_id": true,
    "text_align": "center"
  },
  "items": {
    "show_barcode": false,
    "show_category": false,
    "price_align": "right",
    "max_item_length": 20
  },
  "totals": {
    "show_subtotal": true,
    "show_tax": true,
    "tax_rate": 0.1,
    "show_discount": true
  },
  "footer": {
    "thank_you_message": "Terima Kasih",
    "return_policy": "Barang yang sudah dibeli tidak dapat dikembalikan",
    "show_website": false,
    "text_align": "center"
  }
}
```

## Phase 4: Cash Management Interface (2-3 days)

### 4.1 Cash Movement Interface
**Features:**
- Add/remove cash with reason
- Real-time balance calculation
- Movement history with filtering
- Variance alerts

**Components:**
- `CashManagement.jsx` - Main cash management screen
- `CashMovement.jsx` - Add/edit cash movement
- `CashHistory.jsx` - Movement history list
- `CashBalance.jsx` - Real-time balance display

### 4.2 Shift Dashboard
**Features:**
- Current shift status
- Quick actions (cash in/out)
- Transaction summary
- Cash variance display

## Phase 5: Report Generation & PDF Export (2-3 days)

### 5.1 Shift Report Logic
**Report Components:**
- Shift summary (times, cash, variance)
- Transaction breakdown by payment method
- Hourly sales analysis
- Top products sold
- Cash movement details
- Notes and comments

### 5.2 PDF Generation (A4 Format)
**Library:** Use `printpdf` or `weasyprint` for Rust PDF generation
**Features:**
- Professional A4 formatting
- Tables and charts
- Store branding
- Digital signatures area
- Print-ready layout

**PDF Structure:**
```
Header: Store info, report title, date/time
Section 1: Shift Summary (times, cash amounts, variance)
Section 2: Sales Analysis (payment methods, hourly breakdown)
Section 3: Transaction Details (top sales, product performance)
Section 4: Cash Movements (all manual cash transactions)
Section 5: Notes and Signatures
Footer: Generated by POS System, page numbers
```

### 5.3 Report Viewer Component
- `ShiftReport.jsx` - Display generated reports
- `ReportViewer.jsx` - PDF viewer component
- `ReportExport.jsx` - Export options (print, email, etc.)

## Phase 6: Integration & Testing (2-3 days)

### 6.1 Integration Testing
- Test multi-user scenarios
- Verify POS58 printer functionality
- Test PDF generation
- Validate cash calculations
- Test shift handover process

### 6.2 User Acceptance Testing
- Complete workflow testing
- Performance testing with multiple transactions
- Error handling verification
- Security testing

## Phase 7: Polish & Documentation (1-2 days)

### 7.1 UI/UX Improvements
- Responsive design for all new screens
- Loading states and error handling
- Confirmation dialogs for critical actions
- Keyboard shortcuts for power users

### 7.2 Documentation
- User manual for new features
- Admin setup guide
- POS58 printer setup instructions
- Troubleshooting guide

## Technical Implementation Details

### Dependencies to Add:
```toml
# Rust (Cargo.toml)
bcrypt = "3.1"
printpdf = "0.6" # or weasyprint = "0.22"
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }

# Frontend (package.json)
react-pdf = "^7.0" # PDF viewer
recharts = "^2.0" # Charts for reports
react-hook-form = "^7.0" # Form handling
```

### File Structure Updates:
```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── UserManagement.jsx
│   ├── cash/
│   │   ├── CashManagement.jsx
│   │   ├── CashMovement.jsx
│   │   └── ShiftDashboard.jsx
│   ├── reports/
│   │   ├── ShiftReport.jsx
│   │   ├── ReportViewer.jsx
│   │   └── ReportGenerator.jsx
│   └── settings/
│       ├── ReceiptTemplate.jsx
│       └── PrinterConfig.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── CashContext.jsx
└── utils/
    ├── pdfGenerator.js
    └── escposFormatter.js

src-tauri/src/
├── commands/
│   ├── auth.rs
│   ├── cash.rs
│   ├── reports.rs
│   └── printer.rs
├── models/
│   ├── user.rs
│   ├── shift.rs
│   └── receipt.rs
└── utils/
    ├── escpos.rs
    └── pdf.rs
```

## Estimated Timeline: 12-16 days total

**Priority Order:**
1. Phase 1: Database & Backend (Foundation)
2. Phase 2: Authentication & User Management
3. Phase 3: POS58 Printer Integration (Critical)
4. Phase 4: Cash Management Interface
5. Phase 5: Report Generation & PDF
6. Phase 6: Integration & Testing
7. Phase 7: Polish & Documentation

**Critical Path:** Database → Authentication → POS58 Integration → Cash Management → Reports
