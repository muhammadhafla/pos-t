// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::State;
use std::sync::{Arc, Mutex};
use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use chrono::Utc;
use uuid::Uuid;

// Database state
#[derive(Clone)]
struct Database(Arc<Mutex<Connection>>);

// Product data structure
#[derive(Debug, Serialize, Deserialize)]
struct Product {
    id: String,
    name: String,
    barcode: String,
    price: f64,
    stock: i32,
    category: String,
}

// Transaction data structure
#[derive(Debug, Serialize, Deserialize)]
struct Transaction {
    id: String,
    items: Vec<TransactionItem>,
    total: f64,
    timestamp: String,
    payment_method: String,
}

// Transaction item structure
#[derive(Debug, Serialize, Deserialize)]
struct TransactionItem {
    product_id: String,
    name: String,
    quantity: i32,
    price: f64,
    subtotal: f64,
}

// User data structure
#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: String,
    username: String,
    full_name: String,
    role: String,
    is_active: bool,
    created_at: String,
    last_login: Option<String>,
}

// Cash shift data structure
#[derive(Debug, Serialize, Deserialize)]
struct CashShift {
    id: String,
    user_id: String,
    user_name: String,
    cash_register_id: String,
    start_time: String,
    end_time: Option<String>,
    initial_cash: f64,
    expected_cash: f64,
    actual_cash: Option<f64>,
    difference: Option<f64>,
    status: String,
    notes: Option<String>,
}

// Cash movement data structure
#[derive(Debug, Serialize, Deserialize)]
struct CashMovement {
    id: String,
    shift_id: String,
    transaction_id: Option<String>,
    movement_type: String,
    amount: f64,
    reason: Option<String>,
    timestamp: String,
    user_id: String,
    user_name: String,
}

// Receipt template structure
#[derive(Debug, Serialize, Deserialize)]
struct ReceiptTemplate {
    id: String,
    name: String,
    layout_config: serde_json::Value,
    is_default: bool,
    created_by: String,
    created_at: String,
}

// Printer settings structure
#[derive(Debug, Serialize, Deserialize)]
struct PrinterSettings {
    id: String,
    name: String,
    printer_type: String,
    connection_type: String,
    config: serde_json::Value,
    is_default: bool,
}

// Login data structure
#[derive(Debug, Serialize, Deserialize)]
struct LoginData {
    username: String,
    password: String,
}

// Cash movement input structure
#[derive(Debug, Serialize, Deserialize)]
struct CashMovementInput {
    shift_id: String,
    movement_type: String,
    amount: f64,
    reason: Option<String>,
}

// Shift report data structure
#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
struct ShiftReport {
    id: String,
    shift_id: String,
    report_type: String,
    data: serde_json::Value,
    pdf_path: Option<String>,
    generated_at: String,
    generated_by: String,
}

// Database operations
fn init_database() -> Result<Connection> {
    let conn = Connection::open("pos.db")?;
    
    // Create all tables
    let sql_statements = vec![
        "CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            barcode TEXT UNIQUE NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            category TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            total REAL NOT NULL,
            timestamp TEXT NOT NULL,
            payment_method TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS transaction_items (
            id TEXT PRIMARY KEY,
            transaction_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (transaction_id) REFERENCES transactions (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )",
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'kasir',
            is_active BOOLEAN DEFAULT 1,
            created_at TEXT NOT NULL,
            last_login TEXT
        )",
        "CREATE TABLE IF NOT EXISTS cash_registers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT,
            is_active BOOLEAN DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS cash_shifts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            cash_register_id TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            initial_cash REAL NOT NULL DEFAULT 0,
            expected_cash REAL DEFAULT 0,
            actual_cash REAL,
            difference REAL,
            status TEXT DEFAULT 'open',
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (cash_register_id) REFERENCES cash_registers (id)
        )",
        "CREATE TABLE IF NOT EXISTS cash_movements (
            id TEXT PRIMARY KEY,
            shift_id TEXT NOT NULL,
            transaction_id TEXT,
            movement_type TEXT NOT NULL,
            amount REAL NOT NULL,
            reason TEXT,
            timestamp TEXT NOT NULL,
            user_id TEXT NOT NULL,
            FOREIGN KEY (shift_id) REFERENCES cash_shifts (id),
            FOREIGN KEY (transaction_id) REFERENCES transactions (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )",
        "CREATE TABLE IF NOT EXISTS receipt_templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            layout_config TEXT NOT NULL,
            is_default BOOLEAN DEFAULT 0,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )",
        "CREATE TABLE IF NOT EXISTS printer_settings (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            connection_type TEXT NOT NULL,
            config TEXT NOT NULL,
            is_default BOOLEAN DEFAULT 0
        )",
        "CREATE TABLE IF NOT EXISTS shift_reports (
            id TEXT PRIMARY KEY,
            shift_id TEXT NOT NULL,
            report_type TEXT NOT NULL,
            data TEXT NOT NULL,
            pdf_path TEXT,
            generated_at TEXT NOT NULL,
            generated_by TEXT NOT NULL,
            FOREIGN KEY (shift_id) REFERENCES cash_shifts (id),
            FOREIGN KEY (generated_by) REFERENCES users (id)
        )"
    ];
    
    for sql in sql_statements {
        conn.execute(sql, [])?;
    }
    
    // Initialize default data
    initialize_default_data(&conn)?;
    
    Ok(conn)
}

// Initialize default data
fn initialize_default_data(conn: &Connection) -> Result<()> {
    // Check if users table is empty
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))?;
    
    if count == 0 {
        // Insert default admin user
        let admin_id = Uuid::new_v4().to_string();
        let admin_password = "admin123"; // In production, this should be properly hashed
        let password_hash = bcrypt::hash(admin_password, 10).unwrap_or_else(|_| "".to_string());
        
        conn.execute(
            "INSERT INTO users (id, username, password_hash, full_name, role, is_active, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![admin_id, "admin", password_hash, "Administrator", "admin", 1, Utc::now().to_rfc3339()]
        )?;
        
        // Insert default cashier
        let cashier_id = Uuid::new_v4().to_string();
        let cashier_password = "kasir123";
        let cashier_password_hash = bcrypt::hash(cashier_password, 10).unwrap_or_else(|_| "".to_string());
        
        conn.execute(
            "INSERT INTO users (id, username, password_hash, full_name, role, is_active, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![cashier_id, "kasir", cashier_password_hash, "Kasir Default", "kasir", 1, Utc::now().to_rfc3339()]
        )?;
    }
    
    // Check if cash_registers table is empty
    let register_count: i32 = conn.query_row("SELECT COUNT(*) FROM cash_registers", [], |row| row.get(0))?;
    
    if register_count == 0 {
        // Insert default cash register
        let register_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO cash_registers (id, name, location, is_active) VALUES (?1, ?2, ?3, ?4)",
            params![register_id, "Cash Register 1", "Main Store", 1]
        )?;
    }
    
    // Check if receipt_templates table is empty
    let template_count: i32 = conn.query_row("SELECT COUNT(*) FROM receipt_templates", [], |row| row.get(0))?;
    
    if template_count == 0 {
        // Insert default receipt template
        let template_id = Uuid::new_v4().to_string();
        let admin_id: String = conn.query_row("SELECT id FROM users WHERE username = 'admin' LIMIT 1", [], |row| row.get(0))?;
        
        let default_config = r#"{
            "header": {
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
        }"#;
        
        conn.execute(
            "INSERT INTO receipt_templates (id, name, layout_config, is_default, created_by, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![template_id, "Default Template", default_config, 1, admin_id, Utc::now().to_rfc3339()]
        )?;
    }
    
    // Check if printer_settings table is empty
    let printer_count: i32 = conn.query_row("SELECT COUNT(*) FROM printer_settings", [], |row| row.get(0))?;
    
    if printer_count == 0 {
        // Insert default POS58 printer settings
        let printer_id = Uuid::new_v4().to_string();
        let pos58_config = r#"{
            "model": "POS58",
            "connection_type": "USB",
            "paper_width": 58,
            "character_set": "CP437",
            "font_size": "normal",
            "auto_cut": true,
            "cash_drawer_pulse": true
        }"#;
        
        conn.execute(
            "INSERT INTO printer_settings (id, name, type, connection_type, config, is_default) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![printer_id, "POS58 Thermal Printer", "receipt", "USB", pos58_config, 1]
        )?;
    }
    
    Ok(())
}

// Tauri commands - Existing functionality
#[tauri::command]
fn get_products(db: State<Database>) -> Result<Vec<Product>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, barcode, price, stock, category FROM products").map_err(|e| e.to_string())?;
    
    let product_iter = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            barcode: row.get(2)?,
            price: row.get(3)?,
            stock: row.get(4)?,
            category: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut products = Vec::new();
    for product in product_iter {
        products.push(product.map_err(|e| e.to_string())?);
    }
    
    Ok(products)
}

#[tauri::command]
fn get_product_by_barcode(barcode: String, db: State<Database>) -> Result<Option<Product>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, barcode, price, stock, category FROM products WHERE barcode = ?1").map_err(|e| e.to_string())?;
    
    match stmt.query_row(params![barcode], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            barcode: row.get(2)?,
            price: row.get(3)?,
            stock: row.get(4)?,
            category: row.get(5)?,
        })
    }) {
        Ok(product) => Ok(Some(product)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn create_transaction(items: Vec<TransactionItem>, payment_method: String, db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let transaction_id = Uuid::new_v4().to_string();
    let total: f64 = items.iter().map(|item| item.subtotal).sum();
    let timestamp = Utc::now().to_rfc3339();
    
    // Insert transaction
    conn.execute(
        "INSERT INTO transactions (id, total, timestamp, payment_method) VALUES (?1, ?2, ?3, ?4)",
        params![transaction_id, total, timestamp, payment_method]
    ).map_err(|e| e.to_string())?;
    
    // Insert transaction items and update stock
    for item in &items {
        // Insert transaction item
        let item_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO transaction_items (id, transaction_id, product_id, name, quantity, price, subtotal) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![item_id, transaction_id, item.product_id, item.name, item.quantity, item.price, item.subtotal]
        ).map_err(|e| e.to_string())?;
        
        // Update product stock
        conn.execute(
            "UPDATE products SET stock = stock - ?1 WHERE id = ?2",
            params![item.quantity, item.product_id]
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(transaction_id)
}

#[tauri::command]
fn get_transactions(db: State<Database>) -> Result<Vec<Transaction>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Get transactions
    let mut stmt = conn.prepare("SELECT id, total, timestamp, payment_method FROM transactions ORDER BY timestamp DESC").map_err(|e| e.to_string())?;
    
    let mut transactions = Vec::new();
    let transaction_iter = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get::<_, String>(3)?))
    }).map_err(|e| e.to_string())?;
    
    for transaction_result in transaction_iter {
        let (id, total, timestamp, payment_method) = transaction_result.map_err(|e| e.to_string())?;
        
        // Get transaction items
        let mut item_stmt = conn.prepare("SELECT product_id, name, quantity, price, subtotal FROM transaction_items WHERE transaction_id = ?1").map_err(|e| e.to_string())?;
        let mut items = Vec::new();
        
        let item_iter = item_stmt.query_map(params![id], |row| {
            Ok(TransactionItem {
                product_id: row.get(0)?,
                name: row.get(1)?,
                quantity: row.get(2)?,
                price: row.get(3)?,
                subtotal: row.get(4)?,
            })
        }).map_err(|e| e.to_string())?;
        
        for item in item_iter {
            items.push(item.map_err(|e| e.to_string())?);
        }
        
        transactions.push(Transaction {
            id,
            items,
            total,
            timestamp,
            payment_method,
        });
    }
    
    Ok(transactions)
}

#[tauri::command]
fn update_product_stock(product_id: String, new_stock: i32, db: State<Database>) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE products SET stock = ?1 WHERE id = ?2",
        params![new_stock, product_id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// Tauri commands - New Cash Management & User Authentication

#[tauri::command]
fn authenticate_user(login_data: LoginData, db: State<Database>) -> Result<Option<User>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("SELECT id, username, password_hash, full_name, role, is_active, created_at, last_login FROM users WHERE username = ?1").map_err(|e| e.to_string())?;
    
    match stmt.query_row(params![login_data.username], |row| {
        let id: String = row.get(0)?;
        let username: String = row.get(1)?;
        let password_hash: String = row.get(2)?;
        let full_name: String = row.get(3)?;
        let role: String = row.get(4)?;
        let is_active: bool = row.get(5)?;
        let created_at: String = row.get(6)?;
        let last_login: Option<String> = row.get(7)?;
        
        let user = User {
            id,
            username,
            full_name,
            role,
            is_active,
            created_at,
            last_login,
        };
        
        // Verify password and return result
        let password_valid = bcrypt::verify(&login_data.password, &password_hash).unwrap_or(false) && is_active;
        Ok((user, password_valid))
    }) {
        Ok((mut user, password_valid)) => {
            if password_valid {
                // Update last login
                let now = Utc::now().to_rfc3339();
                conn.execute(
                    "UPDATE users SET last_login = ?1 WHERE id = ?2",
                    params![now, user.id]
                ).map_err(|e| e.to_string())?;
                
                user.last_login = Some(now);
                Ok(Some(user))
            } else {
                Ok(None)
            }
        },
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn get_users(db: State<Database>) -> Result<Vec<User>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, username, full_name, role, is_active, created_at, last_login FROM users").map_err(|e| e.to_string())?;
    
    let user_iter = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            full_name: row.get(2)?,
            role: row.get(3)?,
            is_active: row.get(4)?,
            created_at: row.get(5)?,
            last_login: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut users = Vec::new();
    for user in user_iter {
        users.push(user.map_err(|e| e.to_string())?);
    }
    
    Ok(users)
}

#[tauri::command]
fn open_cash_shift(user_id: String, initial_cash: f64, db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Get user's current open shift
    let existing_shift: Option<String> = conn.query_row(
        "SELECT id FROM cash_shifts WHERE user_id = ?1 AND status = 'open'",
        params![user_id],
        |row| row.get(0)
    ).ok();
    
    if let Some(_shift_id) = existing_shift {
        return Err("User already has an open shift".to_string());
    }
    
    // Get default cash register
    let register_id: String = conn.query_row(
        "SELECT id FROM cash_registers WHERE is_active = 1 LIMIT 1",
        [],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    let shift_id = Uuid::new_v4().to_string();
    let start_time = Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO cash_shifts (id, user_id, cash_register_id, start_time, initial_cash, expected_cash, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![shift_id, user_id, register_id, start_time, initial_cash, initial_cash, "open"]
    ).map_err(|e| e.to_string())?;
    
    // Add initial cash movement
    let movement_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO cash_movements (id, shift_id, movement_type, amount, reason, timestamp, user_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![movement_id, shift_id, "cash_in", initial_cash, "Opening cash", start_time, user_id]
    ).map_err(|e| e.to_string())?;
    
    Ok(shift_id)
}

#[tauri::command]
fn get_current_shift(user_id: String, db: State<Database>) -> Result<Option<CashShift>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("
        SELECT cs.id, cs.user_id, u.full_name, cs.cash_register_id, cs.start_time, cs.end_time, 
               cs.initial_cash, cs.expected_cash, cs.actual_cash, cs.difference, cs.status, cs.notes
        FROM cash_shifts cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.user_id = ?1 AND cs.status = 'open'
        ORDER BY cs.start_time DESC
        LIMIT 1
    ").map_err(|e| e.to_string())?;
    
    match stmt.query_row(params![user_id], |row| {
        Ok(CashShift {
            id: row.get(0)?,
            user_id: row.get(1)?,
            user_name: row.get(2)?,
            cash_register_id: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            initial_cash: row.get(6)?,
            expected_cash: row.get(7)?,
            actual_cash: row.get(8)?,
            difference: row.get(9)?,
            status: row.get(10)?,
            notes: row.get(11)?,
        })
    }) {
        Ok(shift) => Ok(Some(shift)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn add_cash_movement(movement_input: CashMovementInput, user_id: String, db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let movement_id = Uuid::new_v4().to_string();
    let timestamp = Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO cash_movements (id, shift_id, movement_type, amount, reason, timestamp, user_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![movement_id, movement_input.shift_id, movement_input.movement_type, movement_input.amount, movement_input.reason, timestamp, user_id]
    ).map_err(|e| e.to_string())?;
    
    // Update expected cash in shift
    let sign = match movement_input.movement_type.as_str() {
        "cash_in" | "sale" => 1.0,
        "cash_out" | "adjustment" => -1.0,
        _ => 0.0,
    };
    
    let adjustment = movement_input.amount * sign;
    
    conn.execute(
        "UPDATE cash_shifts SET expected_cash = expected_cash + ?1 WHERE id = ?2",
        params![adjustment, movement_input.shift_id]
    ).map_err(|e| e.to_string())?;
    
    Ok(movement_id)
}

#[tauri::command]
fn get_cash_movements(shift_id: String, db: State<Database>) -> Result<Vec<CashMovement>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("
        SELECT cm.id, cm.shift_id, cm.transaction_id, cm.movement_type, cm.amount, cm.reason, cm.timestamp, cm.user_id, u.full_name
        FROM cash_movements cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.shift_id = ?1
        ORDER BY cm.timestamp DESC
    ").map_err(|e| e.to_string())?;
    
    let movement_iter = stmt.query_map(params![shift_id], |row| {
        Ok(CashMovement {
            id: row.get(0)?,
            shift_id: row.get(1)?,
            transaction_id: row.get(2)?,
            movement_type: row.get(3)?,
            amount: row.get(4)?,
            reason: row.get(5)?,
            timestamp: row.get(6)?,
            user_id: row.get(7)?,
            user_name: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut movements = Vec::new();
    for movement in movement_iter {
        movements.push(movement.map_err(|e| e.to_string())?);
    }
    
    Ok(movements)
}

#[tauri::command]
fn get_receipt_templates(db: State<Database>) -> Result<Vec<ReceiptTemplate>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, layout_config, is_default, created_by, created_at FROM receipt_templates").map_err(|e| e.to_string())?;
    
    let template_iter = stmt.query_map([], |row| {
        Ok(ReceiptTemplate {
            id: row.get(0)?,
            name: row.get(1)?,
            layout_config: serde_json::from_str(row.get::<_, String>(2)?.as_str()).unwrap_or_default(),
            is_default: row.get(3)?,
            created_by: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut templates = Vec::new();
    for template in template_iter {
        templates.push(template.map_err(|e| e.to_string())?);
    }
    
    Ok(templates)
}

#[tauri::command]
fn get_printer_settings(db: State<Database>) -> Result<Vec<PrinterSettings>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, type, connection_type, config, is_default FROM printer_settings").map_err(|e| e.to_string())?;
    
    let printer_iter = stmt.query_map([], |row| {
        Ok(PrinterSettings {
            id: row.get(0)?,
            name: row.get(1)?,
            printer_type: row.get(2)?,
            connection_type: row.get(3)?,
            config: serde_json::from_str(row.get::<_, String>(4)?.as_str()).unwrap_or_default(),
            is_default: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut printers = Vec::new();
    for printer in printer_iter {
        printers.push(printer.map_err(|e| e.to_string())?);
    }
    
    Ok(printers)
}

#[tauri::command]
fn print_receipt(transaction: Transaction, store_name: String, store_address: String) -> Result<(), String> {
    // This is a placeholder for actual printing logic
    // In a real implementation, you would interface with the system's print API
    println!("=== {} ===", store_name);
    println!("{}", store_address);
    println!("------------------------");
    println!("Transaction ID: {}", transaction.id);
    println!("Date: {}", transaction.timestamp);
    println!("------------------------");
    
    for item in &transaction.items {
        println!("{} x{} - ${:.2}", item.name, item.quantity, item.subtotal);
    }
    
    println!("------------------------");
    println!("TOTAL: ${:.2}", transaction.total);
    println!("Payment: {}", transaction.payment_method);
    println!("Thank you for your business!");
    
    Ok(())
}

// Shift Report Data Structure
#[derive(Debug, Serialize, Deserialize)]
struct ShiftReportData {
    shift_info: serde_json::Value,
    cash_summary: serde_json::Value,
    movements: Vec<serde_json::Value>,
    transactions: Vec<serde_json::Value>,
}

#[tauri::command]
fn generate_shift_report(shift_id: String, user_id: String, db: State<Database>) -> Result<ShiftReport, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Get shift info
    let shift_info: serde_json::Value = conn.query_row(
        "SELECT cs.*, u.full_name as user_name, cr.name as register_name
         FROM cash_shifts cs
         JOIN users u ON cs.user_id = u.id
         JOIN cash_registers cr ON cs.cash_register_id = cr.id
         WHERE cs.id = ?1",
        params![shift_id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "user_id": row.get::<_, String>(1)?,
                "user_name": row.get::<_, String>(14)?,
                "cash_register_id": row.get::<_, String>(3)?,
                "register_name": row.get::<_, String>(15)?,
                "start_time": row.get::<_, String>(4)?,
                "end_time": row.get::<_, Option<String>>(5)?,
                "initial_cash": row.get::<_, f64>(6)?,
                "expected_cash": row.get::<_, f64>(7)?,
                "actual_cash": row.get::<_, Option<f64>>(8)?,
                "difference": row.get::<_, Option<f64>>(9)?,
                "status": row.get::<_, String>(10)?,
                "notes": row.get::<_, Option<String>>(11)?,
            }))
        }
    ).map_err(|e| e.to_string())?;
    
    // Get cash movements
    let movements: Vec<serde_json::Value> = conn.prepare(
        "SELECT cm.*, u.full_name as user_name
         FROM cash_movements cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.shift_id = ?1
         ORDER BY cm.timestamp DESC"
    ).map_err(|e| e.to_string())?
    .query_map(params![shift_id], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "shift_id": row.get::<_, String>(1)?,
            "transaction_id": row.get::<_, Option<String>>(2)?,
            "movement_type": row.get::<_, String>(3)?,
            "amount": row.get::<_, f64>(4)?,
            "reason": row.get::<_, Option<String>>(5)?,
            "timestamp": row.get::<_, String>(6)?,
            "user_id": row.get::<_, String>(7)?,
            "user_name": row.get::<_, String>(8)?,
        }))
    }).map_err(|e| e.to_string())?
    .filter_map(|m| m.ok())
    .collect();
    
    // Calculate cash summary
    let total_cash_in: f64 = movements.iter()
        .filter(|m| m["movement_type"] == "cash_in" || m["movement_type"] == "sale")
        .map(|m| m["amount"].as_f64().unwrap_or(0.0))
        .sum();
    
    let total_cash_out: f64 = movements.iter()
        .filter(|m| m["movement_type"] == "cash_out" || m["movement_type"] == "adjustment")
        .map(|m| m["amount"].as_f64().unwrap_or(0.0))
        .sum();
    
    let cash_summary = serde_json::json!({
        "total_cash_in": total_cash_in,
        "total_cash_out": total_cash_out,
        "net_movement": total_cash_in - total_cash_out,
        "initial_cash": shift_info["initial_cash"],
        "expected_cash": shift_info["expected_cash"],
        "actual_cash": shift_info["actual_cash"],
        "difference": shift_info["difference"],
    });
    
    // Get transactions for this shift (based on cash movements with transaction_id)
    let transaction_ids: Vec<String> = movements.iter()
        .filter_map(|m| m.get("transaction_id").and_then(|v| v.as_str()).map(|s| s.to_string()))
        .filter(|id| !id.is_empty())
        .collect();
    
    let mut transactions_data: Vec<serde_json::Value> = Vec::new();
    
    for tx_id in &transaction_ids {
        match conn.query_row(
            "SELECT t.id, t.total, t.timestamp, t.payment_method, GROUP_CONCAT(ti.name || ' x' || ti.quantity, ', ') as items
             FROM transactions t
             LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
             WHERE t.id = ?1
             GROUP BY t.id",
            params![tx_id.as_str()],
            |row| {
                Ok(serde_json::json!({
                    "id": row.get::<_, String>(0)?,
                    "total": row.get::<_, f64>(1)?,
                    "timestamp": row.get::<_, String>(2)?,
                    "payment_method": row.get::<_, String>(3)?,
                    "items": row.get::<_, Option<String>>(4)?,
                }))
            }
        ) {
            Ok(t) => transactions_data.push(t),
            Err(rusqlite::Error::QueryReturnedNoRows) => {},
            Err(e) => return Err(e.to_string()),
        }
    }
    
    let report_data = ShiftReportData {
        shift_info,
        cash_summary,
        movements,
        transactions: transactions_data,
    };
    
    let report = ShiftReport {
        id: Uuid::new_v4().to_string(),
        shift_id,
        report_type: "daily".to_string(),
        data: serde_json::to_value(report_data).map_err(|e| e.to_string())?,
        pdf_path: None,
        generated_at: Utc::now().to_rfc3339(),
        generated_by: user_id,
    };
    
    Ok(report)
}

#[tauri::command]
fn save_shift_report(report: ShiftReport, db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let data_json = serde_json::to_string(&report.data).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO shift_reports (id, shift_id, report_type, data, pdf_path, generated_at, generated_by) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![report.id, report.shift_id, report.report_type, data_json, report.pdf_path, report.generated_at, report.generated_by]
    ).map_err(|e| e.to_string())?;
    
    Ok(report.id)
}

#[tauri::command]
fn get_shift_reports(db: State<Database>) -> Result<Vec<ShiftReport>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, shift_id, report_type, data, pdf_path, generated_at, generated_by FROM shift_reports ORDER BY generated_at DESC").map_err(|e| e.to_string())?;
    
    let report_iter = stmt.query_map([], |row| {
        Ok(ShiftReport {
            id: row.get(0)?,
            shift_id: row.get(1)?,
            report_type: row.get(2)?,
            data: serde_json::from_str(row.get::<_, String>(3)?.as_str()).unwrap_or_default(),
            pdf_path: row.get(4)?,
            generated_at: row.get(5)?,
            generated_by: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut reports = Vec::new();
    for report in report_iter {
        reports.push(report.map_err(|e| e.to_string())?);
    }
    
    Ok(reports)
}

#[tauri::command]
fn close_cash_shift(shift_id: String, actual_cash: f64, user_id: String, notes: Option<String>, db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let end_time = Utc::now().to_rfc3339();
    let expected_cash: f64 = conn.query_row(
        "SELECT expected_cash FROM cash_shifts WHERE id = ?1",
        params![shift_id],
        |row| row.get::<_, f64>(0)
    ).map_err(|e| e.to_string())?;
    
    let difference = actual_cash - expected_cash;
    
    conn.execute(
        "UPDATE cash_shifts SET end_time = ?1, actual_cash = ?2, difference = ?3, status = 'closed', notes = ?4 WHERE id = ?5",
        params![end_time, actual_cash, difference, notes, &shift_id]
    ).map_err(|e| e.to_string())?;
    
    // Drop the connection before calling generate_shift_report to avoid borrow issues
    drop(conn);
    
    // Generate and save shift report
    let report = generate_shift_report(shift_id.clone(), user_id, db.clone())?;
    save_shift_report(report, db)?;
    
    Ok(shift_id)
}

fn main() {
    tauri::Builder::default()
        .manage(Database(Arc::new(Mutex::new(
            init_database().expect("Failed to initialize database")
        ))))
        .invoke_handler(tauri::generate_handler![
            // Existing commands
            get_products,
            get_product_by_barcode,
            create_transaction,
            get_transactions,
            update_product_stock,
            print_receipt,
            // New cash management commands
            authenticate_user,
            get_users,
            open_cash_shift,
            get_current_shift,
            add_cash_movement,
            get_cash_movements,
            get_receipt_templates,
            get_printer_settings,
            // Shift report commands
            generate_shift_report,
            save_shift_report,
            get_shift_reports,
            close_cash_shift
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
