<?php
/**
 * colorSelect
 * @version 1.0
 * @copyright 18/11/2018, ghoul.ru
 * DESCRIPTION:
 *
 * Выбор цвета товара
 * Выводится на странице товара и в списке товаров, влияет на добавление в корзину
 * Версия 1.0 не поддерживает чанки
 *
 * PROPERTIES:
 * &tv - Имя выбираемого TV
 * &title - Заголовок
 * &id - ид раздела
 *
 *
 * USAGE:
 * [[!colorSelect? &tv=`tv-name` &title=`Заголовок` &id=`123`]]
 *
 */
if (!isset($tv))
    return 'Не задан параметр tv при вызове сниппета colorSelect';

$docId = isset($id) ? $id : $modx->resource->get('id');


$page = $modx->getObject('modResource', $docId);

$docValues = explode(";",$page->getTVValue($tv));
if (empty($docValues))
    return;

$color = $modx->resource->getOne('TemplateVars', ['name' => $tv]);
if ($color == null)
    return 'TV "'.$tv.'" не найдена';

$colors = [];
$elements = explode("||", $color->get('elements'));
if (empty($elements))
    return 'TV "'.$tv.'" не имеет предустановленных значений';

foreach ($elements as $elem) {
    $v = explode("==", $elem);

    if (in_array($v[1], $docValues)) {
        $t = explode(",", $v[0]);
        $colors[ $v[1] ] = [
            'color' => $t[1],
            'name'  => $t[0]
        ];
    }
}

if (!empty($colors)) {
    $c = '<div class="prod-type -colors">'.(
            isset($title) ? $title : 'Выбрать цвет:'
        );

    foreach ($colors as $val => $clr) {
        $c .= '<label>
        <input type="radio" name="color-'.$docId.'" value="'.$val.'"'.(
            !$val ? ' checked' : ''
            ).' data-name="'.$clr['name'].'"/><i class="prod-color-ico" style="background: #'.$clr['color'].'"><div class="prod-color-big" style="background: #'.$clr['color'].'"></div></i>'.$clr['name'].'</label>';
    }
    $c .= '</div>';

    return $c;
}