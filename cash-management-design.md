# Cash Management & Shift Report System Design

## 1. Database Schema Enhancements

### New Tables Required:

```sql
-- Cash Registers (for multiple cash drawers)
CREATE TABLE cash_registers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Cash Shifts
CREATE TABLE cash_shifts (
    id TEXT PRIMARY KEY,
    cashier_name TEXT NOT NULL,
    cash_register_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    initial_cash REAL NOT NULL DEFAULT 0,
    expected_cash REAL DEFAULT 0,
    actual_cash REAL,
    difference REAL,
    status TEXT DEFAULT 'open', -- open, closed, suspended
    notes TEXT,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers (id)
);

-- Cash Movements (cash in/out tracking)
CREATE TABLE cash_movements (
    id TEXT PRIMARY KEY,
    shift_id TEXT NOT NULL,
    transaction_id TEXT, -- NULL for manual movements
    type TEXT NOT NULL, -- sale, cash_in, cash_out, adjustment
    amount REAL NOT NULL,
    reason TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES cash_shifts (id),
    FOREIGN KEY (transaction_id) REFERENCES transactions (id)
);

-- Receipt Templates
CREATE TABLE receipt_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    layout_config TEXT NOT NULL, -- JSON configuration
    is_default BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL
);

-- Printer Settings
CREATE TABLE printer_settings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- receipt, kitchen, label
    connection_type TEXT NOT NULL, -- usb, network, bluetooth
    config TEXT NOT NULL, -- JSON configuration
    is_default BOOLEAN DEFAULT 0
);

-- Shift Reports
CREATE TABLE shift_reports (
    id TEXT PRIMARY KEY,
    shift_id TEXT NOT NULL,
    report_type TEXT NOT NULL, -- summary, detailed
    data TEXT NOT NULL, -- JSON report data
    generated_at TEXT NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES cash_shifts (id)
);
```

## 2. ESC/POS Printer Integration

### Receipt Printing Commands:
```rust
// ESC/POS Command Templates
const ESC_POS_COMMANDS: &[u8] = &[
    0x1B, 0x40,           // Initialize printer
    0x1B, 0x61, 0x01,     // Center alignment
    0x1D, 0x21, 0x11,     // Double height/width for title
];

// Print functions
fn print_receipt_header(printer: &mut Printer, store_info: &StoreInfo);
fn print_receipt_items(printer: &mut Printer, items: &[TransactionItem]);
fn print_receipt_total(printer: &mut Printer, total: f64, payment_method: &str);
fn print_receipt_footer(printer: &mut Printer, receipt_number: &str);
```

## 3. Receipt Layout System

### Configurable Elements:
- **Header**: Store name, address, phone, logo
- **Items**: Product name, quantity, price, subtotal
- **Totals**: Subtotal, tax, discount, total
- **Payment**: Payment method, change given
- **Footer**: Thank you message, return policy, barcode

### JSON Layout Configuration:
```json
{
  "header": {
    "show_logo": true,
    "show_address": true,
    "show_phone": true,
    "show_tax_id": true
  },
  "items": {
    "show_barcode": false,
    "show_category": false,
    "align_prices": "right"
  },
  "totals": {
    "show_tax_breakdown": true,
    "show_discounts": true
  },
  "footer": {
    "thank_you_message": "Terima Kasih",
    "return_policy": "Barang yang sudah dibeli tidak dapat dikembalikan",
    "show_barcode": true
  }
}
```

## 4. Cash Management Features

### Shift Management:
1. **Opening Cash**: Set initial cash amount at shift start
2. **Cash Tracking**: Record all cash in/out movements
3. **Real-time Balance**: Current expected cash in drawer
4. **Cash Count**: Physical count verification at shift end
5. **Variance Reporting**: Difference between expected vs actual

### Cash Movement Types:
- **Sale**: Cash received from transactions
- **Cash In**: Manual cash added (bank deposit withdrawal)
- **Cash Out**: Manual cash removed (bank deposit)
- **Adjustment**: Corrections for errors

## 5. Shift Report Components

### Summary Report:
- Shift start/end times
- Opening/closing cash amounts
- Total sales by payment method
- Cash variance
- Transaction count

### Detailed Report:
- Hourly sales breakdown
- Top selling products
- Cash movement history
- Discount/refund summary
- Average transaction value

## 6. User Interface Design

### New Screens:
1. **Shift Dashboard**: Current shift status and quick actions
2. **Cash Management**: Cash in/out movements
3. **Shift Reports**: View and print shift reports
4. **Receipt Templates**: Customize receipt layouts
5. **Printer Settings**: Configure POS printers

### Navigation Enhancement:
- Add "Cashier" tab to main navigation
- Sub-navigation for: Shift, Reports, Settings
- Quick action buttons for common tasks

## 7. Security & Audit

### Cash Security:
- Require cashier authentication for cash operations
- Log all cash movements with timestamps
- Manager approval for large cash adjustments
- Automatic variance alerts

### Audit Trail:
- Track who opened/closed each shift
- Record all cash movement reasons
- Generate audit reports for management

## 8. Integration Points

### Existing System Integration:
- Extend current transaction system
- Add cash tracking to existing sales flow
- Integrate with current inventory system
- Enhance receipt printing (currently console-based)

### New Dependencies:
- ESC/POS printer library
- Date/time handling
- JSON configuration management
- PDF generation for reports (optional)
