<?php

require dirname(__DIR__).'/vendor/autoload.php';

// Keep environment variables synchronized for KernelTestCase.
$_SERVER['APP_ENV'] = $_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? 'test';
$_ENV['APP_ENV'] = (string) $_SERVER['APP_ENV'];
putenv('APP_ENV='.$_ENV['APP_ENV']);

$_SERVER['APP_DEBUG'] = $_SERVER['APP_DEBUG'] ?? $_ENV['APP_DEBUG'] ?? '1';
$_ENV['APP_DEBUG'] = (string) $_SERVER['APP_DEBUG'];
putenv('APP_DEBUG='.$_ENV['APP_DEBUG']);

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}
