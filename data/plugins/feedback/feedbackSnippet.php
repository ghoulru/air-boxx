<?php
$result = array(
    'error'     => array(),
    'msg'       => array(),
    'html'      => '',
    'title'     => ''
);
if (!isset($_POST['action'])) {
    $result['error'][] = 'Не задан параметр action';
    echo json_encode($result);
}

require_once MODX_ASSETS_PATH . 'plugins/feedback/feedback.php';

$fb = new Feedback($modx);
if ($_POST['action'] == 'getForm') {
    if (isset($_POST['postData']['id']) && is_numeric($_POST['postData']['id'])) {

        list($result['title'], $result['html']) = $fb->getForm($_POST['postData']['id']);
        //pre($result);

    }
    else
        $result['error'][] = 'Не задан ИД ресурса с формой';
}
elseif ($_POST['action'] == 'feedback') {
    if (isset($_POST['postData']['id']) && is_numeric($_POST['postData']['id'])) {
        $res = $fb->send($_POST['postData']['id'], $_POST['postData']);


        $result = array_merge($result, $res);
    }
    else
        $result['error'][] = 'Не задан ИД ресурса с телом письма';
}
elseif ($_POST['action'] == 'uploadFile') {
    if (isset($_FILES['file']) && !empty($_FILES['file'])) {
        //move_uploaded_file()
        pre($_FILES['file']);
    }

}
else
    $result['error'][] = 'Не определен обработчик действия: ' . $_POST['action'];

exit(json_encode($result));