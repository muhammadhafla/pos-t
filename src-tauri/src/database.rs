use rusqlite::{Connection, Result, params};
use uuid::Uuid;

// Initialize database with sample data
pub fn initialize_database_with_sample_data(conn: &Connection) -> Result<()> {
    // Check if products table is empty
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0))?;
    
    if count == 0 {
        // Insert sample products
        let sample_products = vec![
            ("Sample Product 1", "1234567890123", 10.99, 50, "Electronics"),
            ("Sample Product 2", "2345678901234", 5.99, 100, "Food"),
            ("Sample Product 3", "3456789012345", 15.99, 25, "Clothing"),
            ("Sample Product 4", "4567890123456", 8.99, 75, "Books"),
            ("Sample Product 5", "5678901234567", 12.99, 30, "Electronics"),
        ];
        
        for (name, barcode, price, stock, category) in &sample_products {
            conn.execute(
                "INSERT INTO products (id, name, barcode, price, stock, category) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![Uuid::new_v4().to_string(), name, barcode, price, stock, category]
            )?;
        }
    }
    
    Ok(())
}

// Product management functions
pub fn add_product(conn: &Connection, name: &str, barcode: &str, price: f64, stock: i32, category: &str) -> Result<String> {
    let id = Uuid::new_v4().to_string();
    
    conn.execute(
        "INSERT INTO products (id, name, barcode, price, stock, category) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, name, barcode, price, stock, category]
    )?;
    
    Ok(id)
}

pub fn update_product(conn: &Connection, id: &str, name: &str, barcode: &str, price: f64, stock: i32, category: &str) -> Result<()> {
    conn.execute(
        "UPDATE products SET name = ?1, barcode = ?2, price = ?3, stock = ?4, category = ?5 WHERE id = ?6",
        params![name, barcode, price, stock, category, id]
    )?;
    
    Ok(())
}

pub fn delete_product(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn get_product_by_id(conn: &Connection, id: &str) -> Result<Option<(String, String, String, f64, i32, String)>> {
    match conn.query_row(
        "SELECT id, name, barcode, price, stock, category FROM products WHERE id = ?1",
        params![id],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?))
    ) {
        Ok(product) => Ok(Some(product)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}