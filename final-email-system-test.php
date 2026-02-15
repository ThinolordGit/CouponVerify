<?php
/**
 * final-email-system-test.php
 * Complete email system test
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Utils/AdminConfig.php';
require_once __DIR__ . '/autoload.php';

use App\Utils\AdminConfig;
use App\Services\EmailService;

echo "╔══════════════════════════════════════════════════════════════════╗\n";
echo "║          🧪 Final Email System Comprehensive Test                ║\n";
echo "╚══════════════════════════════════════════════════════════════════╝\n\n";

$tests_passed = 0;
$tests_failed = 0;

function test($name, $fn, $pdo = null) {
    global $tests_passed, $tests_failed;
    try {
        echo "🔍 Testing: $name... ";
        $result = $fn($pdo);
        if ($result) {
            echo "✅ PASS\n";
            $tests_passed++;
        } else {
            echo "❌ FAIL\n";
            $tests_failed++;
        }
    } catch (Exception $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
        $tests_failed++;
    }
}

try {
    AdminConfig::init($pdo);

    // Test 1: SMTP Configuration
    test("SMTP Configuration Loaded", function($db) {
        $host = AdminConfig::getOption('SMTP_HOST');
        $user = AdminConfig::getOption('SMTP_USER');
        $port = AdminConfig::getOption('SMTP_PORT');
        return !empty($host) && !empty($user) && !empty($port);
    }, $pdo);

    // Test 2: SMTP_SECURE Format
    test("SMTP_SECURE is proper format (TLS/SSL)", function($db) {
        $secure = AdminConfig::getOption('SMTP_SECURE');
        return in_array($secure, ['TLS', 'SSL']);
    }, $pdo);

    // Test 3: Email Templates Table
    test("email_templates table exists", function($db) {
        $stmt = $db->prepare("SHOW TABLES LIKE 'email_templates'");
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }, $pdo);

    // Test 4: Default Templates Installed
    test("4 default templates installed", function($db) {
        $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM email_templates");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['cnt'] == 4;
    }, $pdo);

    // Test 5: Template Keys
    test("All template keys present", function($db) {
        $keys = ['verification_pending', 'verification_approved', 'verification_rejected', 'verification_blocked'];
        foreach ($keys as $key) {
            $stmt = $db->prepare("SELECT id FROM email_templates WHERE template_key = ?");
            $stmt->execute([$key]);
            if (!$stmt->fetch()) return false;
        }
        return true;
    }, $pdo);

    // Test 6: Template Variables Set
    test("Templates have variables defined", function($db) {
        $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM email_templates WHERE variables IS NOT NULL AND variables != ''");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['cnt'] == 4;
    }, $pdo);

    // Test 7: EmailService Initialization
    test("EmailService initializes successfully", function($db) {
        $sqlHelper = new \stdClass();
        $sqlHelper->db = $db;
        $emailService = new EmailService($sqlHelper);
        return (bool)$emailService;
    }, $pdo);

    // Test 8: API Endpoint Syntax
    test("API endpoint has no syntax errors", function($db) {
        $file = __DIR__ . '/api/admin/email-templates.php';
        $output = shell_exec("php -l \"$file\" 2>&1");
        return strpos($output, 'No syntax errors') !== false;
    }, $pdo);

    // Test 9: Notifications Endpoint Fixed
    test("notifications.php has no syntax errors", function($db) {
        $file = __DIR__ . '/api/admin/notifications.php';
        $output = shell_exec("php -l \"$file\" 2>&1");
        return strpos($output, 'No syntax errors') !== false;
    }, $pdo);

    // Test 10: Template HTML Content
    test("Templates have HTML content", function($db) {
        $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM email_templates WHERE LENGTH(html_body) > 1000");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['cnt'] >= 3;
    }, $pdo);

    echo "\n" . str_repeat("═", 66) . "\n";
    echo "📋 Test Results:\n";
    echo "───────────────────────────────────────────────────────────────\n";
    echo "✅ Passed: $tests_passed\n";
    echo "❌ Failed: $tests_failed\n";
    echo str_repeat("═", 66) . "\n\n";

    if ($tests_failed === 0) {
        echo "🎉 ALL TESTS PASSED!\n\n";
        echo "✨ Email System Status: ✅ FULLY OPERATIONAL\n\n";
        echo "You can now:\n";
        echo "  1. Configure SMTP at /admin-dashboard/email-config\n";
        echo "  2. Customize email templates in the same page\n";
        echo "  3. Send verification/confirmation emails\n";
        echo "  4. Admins receive detailed notifications\n";
        echo "\n";
    } else {
        echo "⚠️  Some tests failed. Please review the errors above.\n";
    }

    echo "📊 System Info:\n";
    echo "───────────────────────────────────────────────────────────────\n";
    
    // Count emails sent (if table exists)
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM email_notifications WHERE status = 'sent'");
        $stmt->execute();
        $result = $stmt->fetch();
        echo "  • Emails successfully sent: " . $result['cnt'] . "\n";
    } catch (Exception $e) {
        echo "  • Email notifications table not ready\n";
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM email_templates");
    $stmt->execute();
    echo "  • Templates in database: " . $stmt->fetchColumn() . "\n";
    
    echo "\n";

} catch (Exception $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
}
?>
