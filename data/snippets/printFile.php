<?php
if (isset($file) && $file !== '') {
    $filePath = $_SERVER['DOCUMENT_ROOT'] . $file;
    if (file_exists($filePath)) {
        return file_get_contents($filePath);
    }
    else
        return 'printFile: Не найден файл: ' . $filePath;
}
else
    return 'Задайте параметр "file" в вызове сниппета printFile';