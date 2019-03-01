<?php
$docId = isset($id) ? $id : $modx->resource->get('id');

$pageSovm = $modx->getObject(
	'modResource',
	[
		'parent' => $docId,
		'longtitle' => 'sovmestimost',
		'published' => 1
	]
);

if ($pageSovm == null)
	return [0, ''];


$defaultContent = $pageSovm->get('content');


$col = $modx->newQuery('modResource');
$col->sortby('pagetitle','ASC');
//	$col->select(array('id','publishedon'));
$col->where(array(
	'parent' => $pageSovm->get('id'),
	'published' => true,
	'deleted' => false
));

$brands = $modx->getCollection(
	'modResource',
	$col
);
//pre(count($brands));

if (!count($brands))
	return [1, $defaultContent];


$brandsInfo = [];
$modelsTableData = [];

$c = '';

//$c .= '<div class="sovm flx -sb -alc">
//                    <div class="-l">
//                        <div class="brands-select">
//                            <div class="tit">
//                                <span>Выберите марку профиля</span>
//                            </div>
//                            <div class="sel">';
foreach ($brands as $brand) {

	$m = json_decode($brand->getTVValue('sovmestimost'));

	if ($m !== null) {
//		$c .= '<a href="#" data-id="'.$brand->get('id').'">'.$brand->get('pagetitle').'</a>';
		$brandsInfo[$brand->get('id')] = $brand->get('pagetitle');
		$modelsTableData[$brand->get('id')] = $m;
	}

}
//$c .= '</div>
//                        </div>
//                    </div>
//                    <div class="-r">
//                        <a href="#" class="sovm-show-all">Показать весь список профилей</a>
//                    </div>
//                </div>';

//pre($modelsTableData, 2);

if (!empty($modelsTableData)) {
	$c .= '<div class="sovm-tables">';
	foreach ($modelsTableData as $id => $models) {
		$c .= '<div class="sovm-tbl t'.$id.'">';
		$c .= '<table>';
		$c .= '<tr><th colspan="3">'.$brandsInfo[ $id ].'</th></tr>';
		$c .= '<tr>
                                <th width="50%">
                                    Название системы
                                </th>
                                <th width="25%">
                                    Модель
                                </th>
                                <th width="25%">
                                    Артикул
                                </th>
                            </tr>';
		foreach ($models as $model) {
			$c .= '<tr>';

			$c .= '<td>'.$model->title.'</td>';
			$c .= '<td>'.$model->model.'</td>';
			$c .= '<td>'.$model->art.'</td>';

			$c .= '</tr>';
		}
		$c .= '</table>';
		$c .= '</div>';
	}
	$c .= '</div>';
}

return [1, $c];