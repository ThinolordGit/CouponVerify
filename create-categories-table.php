<?php
/**
 * create-categories-table.php - Create categories table
 */

require_once __DIR__ . '/config/database.php';

try {
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Category name',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL-friendly slug',
  description TEXT COMMENT 'Category description',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_slug (slug),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL;

    $pdo->exec($sql);
    echo "✓ Categories table created successfully!\n";
    
    // Insert sample data
    $categories = [
        ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Electronic gadgets and devices'],
        ['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Clothing and fashion items'],
        ['name' => 'Food & Beverage', 'slug' => 'food-beverage', 'description' => 'Food and drink coupons'],
        ['name' => 'Travel', 'slug' => 'travel', 'description' => 'Travel and hotel discounts'],
        ['name' => 'Entertainment', 'slug' => 'entertainment', 'description' => 'Movies, games, and entertainment'],
    ];
    
    $stmt = $pdo->prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    
    foreach ($categories as $cat) {
        try {
            $stmt->execute([$cat['name'], $cat['slug'], $cat['description']]);
            echo "  ✓ Inserted: {$cat['name']}\n";
        } catch (\PDOException $e) {
            echo "  ✗ Failed to insert {$cat['name']}: " . $e->getMessage() . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
