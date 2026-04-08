<?php
declare(strict_types=1);
@ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

define('DATA_FILE', dirname(__DIR__) . '/data/comments.json');
define('MAX_COMMENTS', 300);

function lim_str(string $s, int $n): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($s, 0, $n);
    }
    return substr($s, 0, $n);
}

function read_comments(): array
{
    if (!is_readable(DATA_FILE)) {
        return [];
    }
    $raw = file_get_contents(DATA_FILE);
    $data = json_decode($raw !== false && $raw !== '' ? $raw : '[]', true);
    return is_array($data) ? $data : [];
}

function write_comments(array $list): bool
{
    $dir = dirname(DATA_FILE);
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true) && !is_dir($dir)) {
            return false;
        }
    }
    $json = json_encode($list, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }
    return file_put_contents(DATA_FILE, $json, LOCK_EX) !== false;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode(['ok' => true, 'comments' => read_comments()], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $in = json_decode($raw !== false && $raw !== '' ? $raw : '', true);
    if (!is_array($in)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $hp = $in['website'] ?? '';
    if ($hp !== '' && $hp !== null) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Rejected'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $name = trim((string)($in['name'] ?? ''));
    $body = trim((string)($in['body'] ?? ''));

    if ($name === '') {
        $name = '匿名';
    }
    $name = lim_str($name, 40);
    $body = lim_str($body, 800);

    if ($body === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'コメントが空です。'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $name = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $name) ?? '';
    $body = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $body) ?? '';

    $list = read_comments();
    $list[] = [
        'name' => $name,
        'body' => $body,
        'created_at' => date('Y-m-d H:i:s'),
    ];

    if (count($list) > MAX_COMMENTS) {
        $list = array_slice($list, -MAX_COMMENTS);
    }

    if (!write_comments($list)) {
        http_response_code(500);
        echo json_encode(
            ['ok' => false, 'error' => '保存に失敗しました。data フォルダの書き込み権限を確認してください。'],
            JSON_UNESCAPED_UNICODE
        );
        exit;
    }

    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
