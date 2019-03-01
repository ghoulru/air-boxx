<?php
/**
 * Полезные функции
 */
if ($modx->event->name == 'OnMODXInit') {
    if (!function_exists('pre')) {
        function pre($txt, $pre = 1, $title = '', $accessPermitted = false) {
            global $access;

            if ($accessPermitted && !$access->isAccessPermit())
                return;


            $bt = debug_backtrace();
            if ($pre == 3) {
                echo "<pre>";
                foreach ($bt as $item) {
                    echo $item['file'] . '::' . $item['function'] . '(' . $item['line'] . ')<br>';
                }
                echo "</pre>";
            } else {
                echo "<pre>";
                if ($title != '')
                    echo '------------- <strong>' . $title . '</strong> ------------------<br>';
                echo str_replace($_SERVER['DOCUMENT_ROOT'], '', $bt[0]['file']) . '(' . $bt[0]['line'] . ')';

                $argStr = '';
                if (isset($bt[1]['args']) && !empty($bt[1]['args'])) {

                    foreach ($bt[1]['args'] as $arg) {
                        $argStr .= '(' . gettype($arg) . ') ';
                        if (is_array($arg))
                            $argStr .= "array(" . count($arg) . "), ";
                        elseif (is_object($arg))
                            $argStr .= "'" . get_class($arg) . "', ";
                        elseif (is_string($arg))
                            $argStr .= ' len=' . mb_strlen($arg, 'UTF-8') . ', ';
                        else
                            $argStr .= "'{$arg}', ";
                    }
                }

                if (isset($bt[1]['function']))
                    echo ' ->' . $bt[1]['function'] . '(' . rtrim($argStr, ', ') . ')';

                echo '<br>';
                //print_r($bt);
                if ($pre == 2)
                    var_dump($txt);
                elseif ($pre == 1)
                    print_r($txt);
                else
                    echo $txt;
                echo "</pre>";

            }

        }
    }
}