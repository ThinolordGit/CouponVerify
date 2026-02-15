<?php
/**
 * seed-data.php - Seed test data into the database
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Models/CategoryModel.php';
require_once __DIR__ . '/app/Models/UserModel.php';
require_once __DIR__ . '/SQLHelper.php';

try {
    $sqlHelper = new \SQLHelper($pdo);
    
    // Seed categories
    echo "=== Seeding Categories ===\n";
    $categoryModel = new \App\Models\CategoryModel($sqlHelper);
    
    $categories = [
        ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Electronic gadgets and devices'],
        ['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Clothing and fashion items'],
        ['name' => 'Food & Beverage', 'slug' => 'food-beverage', 'description' => 'Food and drink coupons'],
        ['name' => 'Travel', 'slug' => 'travel', 'description' => 'Travel and hotel discounts'],
        ['name' => 'Entertainment', 'slug' => 'entertainment', 'description' => 'Movies, games, and entertainment'],
    ];
    
    foreach ($categories as $cat) {
        try {
            $categoryModel->create($cat);
            echo "  ✓ Created category: {$cat['name']}\n";
        } catch (\Exception $e) {
            echo "  ✗ Failed to create {$cat['name']}: " . $e->getMessage() . "\n";
        }
    }
    
    // Seed users
    echo "\n=== Seeding Users ===\n";
    $userModel = new \App\Models\UserModel($sqlHelper);
    
    $users = [
        ['name' => 'John Doe', 'email' => 'john@example.com', 'status' => 'active'],
        ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'status' => 'active'],
        ['name' => 'Bob Wilson', 'email' => 'bob@example.com', 'status' => 'blocked'],
        ['name' => 'Alice Johnson', 'email' => 'alice@example.com', 'status' => 'active'],
    ];
    
    foreach ($users as $user) {
        try {
            $userModel->create($user);
            echo "  ✓ Created user: {$user['name']}\n";
        } catch (\Exception $e) {
            echo "  ✗ Failed to create {$user['name']}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✓ Seeding complete!\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
