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
require_once MODX_ASSETS_PATH . 'snippets/Cart.php';
//require_once MODX_ASSETS_PATH . 'snippets/Ddelivery.php';

$fb = new Feedback($modx);

$cart = new Cart($modx, ['cartURL' => '/cart/']);



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

        //pre($_POST['postData']);
        $res = $fb->send($_POST['postData']['id'], $_POST['postData']);


        $result = array_merge($result, $res);
    }
    else
        $result['error'][] = 'Не задан ИД ресурса с телом письма';
}
elseif ($_POST['action'] == 'addToCart') {
    if (isset($_POST['postData']['id']) && is_numeric($_POST['postData']['id'])) {

        //pre($_POST['postData']);exit;

        $cart->add(
            $_POST['postData']['id'],
            $_POST['postData']['qty'],
            isset($_POST['postData']['type']) ? $_POST['postData']['type'] : null,
            isset($_POST['postData']['color']) ? $_POST['postData']['color'] : null
        );

        //pre($cart->ajaxResult());
        $result = array_merge($result, $cart->ajaxResult());
    }
    else
        $result['error'][] = 'Неизвестен ИД товара';
}
elseif ($_POST['action'] == 'updateCartQty') {

    if (isset($_POST['postData']['id']) && isset($_POST['postData']['qty'])) {
        $cart->updateQty($_POST['postData']['id'], $_POST['postData']['qty']);

        $result = array_merge($result, $cart->ajaxResult());
    }
    else
        $result['error'][] = 'Неизвестен ИД или кол-во товара';
}
elseif ($_POST['action'] == 'submitOrder') {

    $cart->submitOrder($_POST['postData']);

    $result = array_merge($result, $cart->ajaxResult());
}
elseif ( $_POST['action'] == 'ddeliverySubmitted') {
    
}
elseif ($_POST['action'] == 'activatePromo') {
    if (!isset($_POST['postData']['code']) || trim($_POST['postData']['code']) == '')
        $result['error'][] = 'Не задан промокод';
    else {

        $cart->activatePromo(trim($_POST['postData']['code']));

        $result = array_merge($result, $cart->ajaxResult());
    }
}
elseif ($_POST['action'] == 'uploadFile') {
    if (isset($_FILES['file']) && !empty($_FILES['file'])) {
        $destFilePath = '/upload/user_files/' .mt_rand(0,999) . $_FILES['file']['name'];
        if (move_uploaded_file(
            $_FILES['file']['tmp_name'],
            $_SERVER['DOCUMENT_ROOT'] . $destFilePath
        ))
            $_SESSION['feedbackFile'] = $destFilePath;

    }

}
elseif ($_POST['action'] == 'cartCitySearch') {
    if (isset($_POST['postData']['name']) && trim($_POST['postData']['name']) != '') {

        $cart->searchCity($_POST['postData']['name']);

        $result = array_merge($result, $cart->ajaxResult());

    }
    else
        $result['error'][] = 'Не задано название нас. пункта';
}
elseif ($_POST['action'] == 'cartSaveUserData') {
    if (!empty($_POST['postData'])) {
        foreach ($_POST['postData'] as $key => $val) {
            $_SESSION['user'][ $key ] = $val;
        }
    }
}
elseif ($_POST['action'] == 'cartSetCity') {
    $cart->setCity(
        true,
        $_POST['postData']['cityId'],
        $_POST['postData']['city']
    );
    $result = array_merge($result, $cart->ajaxResult());
}
elseif ($_POST['action'] == 'cartSetDelivery') {


    if (isset($_POST['postData']['companyId']))
        $cart->set('deliveryCompanyId', intval($_POST['postData']['companyId']));

    if (isset($_POST['postData']['price']))
        $cart->set('deliveryPrice', floatval($_POST['postData']['price']));

    $cart->total();

    $result = array_merge($result, $cart->ajaxResult());
}
elseif ($_POST['action'] == 'cartSetDeliveryType') {
    $dType = intval($_POST['postData']['type']);
    $cart->set('deliveryType', $dType);

    $deliveryTypes = $cart->getDeliveryTypesDefined();
    if (isset($deliveryTypes[ $dType ]['title']))
        $cart->set('deliveryTitle', $deliveryTypes[ $dType ]['title']);
}
else
    $result['error'][] = 'Не определен обработчик действия "'.$_POST['action'].'" в ajaxSnippet' ;

exit(json_encode($result));