<?php
/**
 * api/admin/email-templates.php
 * Email Templates Management API
 */

$method = $_SERVER['REQUEST_METHOD'];
$subAction = $GLOBALS['param'] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGetTemplates($subAction);
            break;
        case 'POST':
            handleSaveTemplate($subAction);
            break;
        default:
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Email templates API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
    exit;
}

function handleGetTemplates($subAction) {
    global $pdo;
    
    if ($subAction === 'all') {
        // Get all templates
        $stmt = $pdo->prepare("
            SELECT 
                id,
                template_key,
                name,
                subject,
                html_body,
                text_body,
                variables,
                updated_at
            FROM email_templates
            ORDER BY id ASC
        ");
        $stmt->execute();
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON fields
        foreach ($templates as &$template) {
            $template['variables'] = $template['variables'] ? json_decode($template['variables'], true) : [];
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'templates' => $templates
        ]);
    } else {
        // Get single template by key
        $key = $subAction;
        $stmt = $pdo->prepare("
            SELECT 
                id,
                template_key,
                name,
                subject,
                html_body,
                text_body,
                variables
            FROM email_templates
            WHERE template_key = ?
            LIMIT 1
        ");
        $stmt->execute([$key]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$template) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Template not found']);
            return;
        }

        $template['variables'] = $template['variables'] ? json_decode($template['variables'], true) : [];

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'template' => $template
        ]);
    }
}

function handleSaveTemplate($subAction) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        return;
    }

    $template_key = $data['template_key'] ?? '';
    $name = $data['name'] ?? '';
    $subject = $data['subject'] ?? '';
    $html_body = $data['html_body'] ?? '';
    $text_body = $data['text_body'] ?? '';
    $variables = $data['variables'] ?? [];

    if (!$template_key) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'template_key is required']);
        return;
    }

    try {
        // Check if template exists
        $stmt = $pdo->prepare("SELECT id FROM email_templates WHERE template_key = ?");
        $stmt->execute([$template_key]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update
            $stmt = $pdo->prepare("
                UPDATE email_templates
                SET name = ?, subject = ?, html_body = ?, text_body = ?, variables = ?, updated_at = NOW()
                WHERE template_key = ?
            ");
            $stmt->execute([
                $name,
                $subject,
                $html_body,
                $text_body,
                json_encode($variables),
                $template_key
            ]);
        } else {
            // Insert
            $stmt = $pdo->prepare("
                INSERT INTO email_templates
                (template_key, name, subject, html_body, text_body, variables, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute([
                $template_key,
                $name,
                $subject,
                $html_body,
                $text_body,
                json_encode($variables)
            ]);
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Template saved successfully',
            'template_key' => $template_key
        ]);

    } catch (PDOException $e) {
        error_log("DB Error saving template: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
}
