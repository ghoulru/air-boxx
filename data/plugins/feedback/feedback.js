//alert(123);
var FeedbackSettings = {
    ajaxURL: '/ajax/'
};

$(function(){

    if(!window.jQuery)
        alert('Plugin "feedback" says: Не подключена библиотека jQuery');


      /*
     * get forms
     */
    $(document).on('click', '.js-get-form', function( e ){
        e.preventDefault();

        var resId = $(this).data('id');
        var addStyle = $(this).data('style') || '';
        var data = $(this).data('data');
        var sizes  = null;//размеры окна формы
        if ($(this).data('sizes') != undefined) {
            sizes = $(this).data('sizes').split(';');
        }

        if (resId == undefined || resId == '') {
            alert('Задайте атрибут data-id="" с указанием ID ресурса с формой');
            return;
        }


        var pd = {
            id: resId,
            fromURL : window.location.href,
        };

        if ( typeof data != 'undefined' && data != '') {
            $.each(data, function(i, val){
                pd[ i ] = val;
            });
        }

        ajaxAction(FeedbackSettings.ajaxURL, 'getForm', pd, function($data){
            if( $data.title != undefined && $data.html != ''){
                dialogShow($data.title, $data.html, sizes, null, addStyle);
            }
            else
                dialogShow(1, 'JS: Нет данных для формы');
        });
    });
    $(document).on('click', '.form .js-submit', function( e ){
        var canSend,
            form, formId,
            postData;
        e.preventDefault();

        var letterId = $(this).data('id');

        if (letterId == undefined || letterId == '') {
            alert('Задайте кнопке атрибут data-id="" с указанием ID ресурса с текстом письма');
            return;
        }

        form = $(this).parents('.form');
        canSend = form.checkFormFields({required: '.req', checked: '.save'}, showFormFieldMsg);
        formId = form.children('form').attr('id') || form.attr('id');

        var action  = $(this).data('action') || 'feedback';


        postData = {
            id: letterId,
            formId: formId,
            url: window.location.href
        };

        if(form.find('.save').length) {
            form.find('.save').each(function () {

                if ( $(this).attr('name') != undefined) {
                    if ($(this).attr('type') == 'radio') {
                        if ($(this).is(':checked') && $(this).val() != '')
                        postData[$(this).attr('name')] = $(this).val();
                    }
                    else
                        postData[$(this).attr('name')] = $(this).val();
                }
                else {
                    $(this).css({
                        background: 'red'
                    });
                    alert('У выделенного поля не заполнен аттрибут name');
                }
            });
        }
        else
            alert('Нет полей с классом save в форме #' + formId);

        //console.log(postData);return;

        if( canSend ){
            ajaxAction(FeedbackSettings.ajaxURL, action, postData, function($data){

                dialogShow($data.title, $data.html, null, dialogHide( 20000 ));
                /**/
                $('#' + formId +' .save').each(function(){
                    if (!$(this).hasClass('not-emptify'))
                        $(this).val('');
                });
                /**/

            }, true);

        }

    });

    $(document).on('focus', '.form input, .form textarea', function(){
        var prnt = $(this).closest(formLineClass);
        var msg = prnt.find(formLineMsg);
        msg.fadeOut();
        $(this).removeClass('error');
    });

    $(document).on('change', '.form input[type=file]', function(){
        var form = $(this).closest('form');
        var uploadOptions = {
            url: FeedbackSettings.ajaxURL,
            type: 'post',
            timeout: 30000,
            resetForm: false,
            data: {
                action: 'uploadFile',
                postData: {}
            },
            success: function(response){

            }};

        form.ajaxSubmit(uploadOptions);
    });
});


var formLineClass = '.line';
var formLineMsg = 'i';
function showFormFieldMsg( obj, str, hideTime ){

    var prnt = obj.closest(formLineClass);
    var msg = prnt.find(formLineMsg);

    if (msg == undefined) {
        prnt.prepend(formLineMsg);
        msg = prnt.find(formLineMsg);
    }

    msg.html(str).fadeIn();
    obj.addClass('error');
    if (hideTime != undefined && parseInt(hideTime) > 0)
        setTimeout(function(){
            msg.fadeOut();
        }, hideTime);
}
/**
 * Проверка полей форм
 * @version 1.2.0 02/08/2017
 * @copyright ghoul.ru
 */
(function( $ ){
    $.fn.checkFormFields = function(options, callback) {

        var settings = $.extend( {
            required: '.required', //обязательные поля
            checked	: '', //поля, к. надо проверять
            signs: 'В поле недопустимые знаки',
            format: 'Неверный формат',
            empty : 'Не заполнено',
            not_checked: 'Не отмечено',
            def: 'Ошибка заполнения!',
            errorHideTime: 2000
        }, options);



        var result = true;

        this.find(settings.required).each( function(){

            var msg = '';
            if ($(this).is(':visible')) {
                if ( $(this).attr('type') == 'checkbox' ){

                    if ( !$(this).is(':checked') )
                        msg = settings.not_checked;//$(this).val().trim();
                }
                else {
                    if ($(this).val().trim() == '')
                        msg = settings.empty;
                }
            }
            //console.log($(this).attr('name') + msg);

            if( msg != '' ){
                callback($(this), msg, settings.errorHideTime );
                result = false;
            }
        });


        if( settings.checked != '' )
            this.find(settings.checked).each( function(){

                var value = $(this).val().trim();
                var fieldType = $(this).data('field-type');



                if( $(this).data('min-length') != undefined && $(this).val().length < parseIn($(this).data('min-length')) ){
                    callback($(this), 'Минимальное кол-во знаков ' + $(this).data('min-length'), settings.errorHideTime );
                    result = false;

                }

                if (fieldType != undefined && value != '') {

                    if( fieldType == 'text' && !/^[0-9a-zа-я-_ёЁйЙ\+\(\)\.\'\"\@:;,«»\s\t\!\?\/\\]*$/i.test( value ) ){
                        callback($(this), settings.signs, settings.errorHideTime );
                        result = false;

                    }
                    else if( value != '' && fieldType == 'phone' && !/^[0-9\s\(\)\+-\.]*$/i.test( value ) ){
                        callback($(this), settings.signs, settings.errorHideTime );
                        result = false;

                    }
                    else if( value != '' && fieldType == 'email' && !/^[0-9a-z-._]+@[0-9a-z-._]+.[a-z]{2,5}$/i.test( value ) ){
                        callback($(this), settings.format, settings.errorHideTime );
                        result = false;

                    }
                    else if( fieldType == 'numeric' && !/^[0-9]*$/i.test( value ) ){
                        callback($(this), settings.signs + '. Разрешены только цифры', settings.errorHideTime );
                        result = false;

                    }
                    else if( fieldType == 'url' && !/^(http(s?):\/\/)?.*/i.test( value ) ){
                        callback($(this), settings.format, settings.errorHideTime );
                        result = false;
                    }
                }
            });




        return result;
    }
})( jQuery );

/**
 * Обходит все поля которые необходимо сохранить
 * @param saveClass - объект обхода
 * @returns Object
 */
function getPostData(obj, saveDisabled){
    var postData = {};

    saveDisabled = saveDisabled || false;

    if( typeof obj != 'object')
        obj = $('' + obj +'');

    function countCheckboxes(name) {
        var t = 0;
        $('input[name=' + name + ']').each(function(){
            if ($(this).attr('type') == 'checkbox')
                t++;
        });
        return t;
    }


    obj.each( function(){

        var name = $(this).attr('name');
        var val = $(this).val();
        var type =$(this).attr('type');

        //if (saveDisabled || !$(this).prop('disabled')) {
        {
            if (type == 'checkbox') {

                if (countCheckboxes(name) == 1) {
                    postData[name] = $(this).is(':checked') ? 1 : 0;
                }
                else {
                    if ($(this).attr('type') == 'checkbox' && typeof postData[name] == 'undefined')
                        postData[name] = [];

                    if ($(this).is(':checked'))
                        postData[name].push(val);
                }

            }
            else if (type == 'radio' && $(this).is(':checked') && val != '') {
                postData[name] = val;
            }
            else if (postData[name] == undefined)
                postData[name] = val;
        }

    });

    return postData;
}


