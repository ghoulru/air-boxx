$(document).ready(function() {

    var screenW = $(window).width();
    var isMobile = false;
    if (screenW < 1200)
        isMobile = true;

    App.init(isMobile);
    // Scheme.init(isMobile);
    $( window ).resize(function() {
        this.screenW = $(window).width();

        if (screenW < 1200)
            isMobile = true;
        //App.init(isMobile);
        //Scheme.init(isMobile);
    });

    setTimeout(function(){
        App.header();
    }, 1500);
});


var dataLayer = dataLayer || [];//используется для ecommerce в Яндекс.Метрике


var App = {
    isMobile: false,
    screenW: 0,
    desktopWidth: 1010,
    scrollTop: 150,
    inits: [],//массив  инициализованных блоков
    reviewsFormHeight: 0,// высота формы в отзывах

    init: function(isMobile){

        var self = this;
        this.isMobile = isMobile;
        this.screenW = $(window).width();

        this.scrollTop = $('.head').height();

        if( this.screenW < this.desktopWidth)
            this.isMobile = true;

        this.menuMainMobi();

        /*this.menuMain();
        this.scrollHandle();

        this.initSliders();*/

        this.initZoom();
        // this.initKolvo();


        this.initActions(function(){
            self.initTabs();
        });

        this.productGallery();
        this.scrollHandle();
        this.header();
        //console.log(this.inits);
    },
    initBlocks: function() {

    },
    // initKolvo: function() {
    //     $('.kolvo i').click(function() {
    //         var prnt = $(this).parent('.kolvo');
    //         var inp = $(this).parent('.kolvo').find('input');
    //         var v = parseInt(inp.val());
    //
    //         if (!$(this).hasClass('disabled')) {
    //
    //             if ($(this).hasClass('plus'))
    //                 v++;
    //             else {
    //                 v--;
    //                 if (v < 1)
    //                     v = 1;
    //             }
    //
    //             inp.val(v);
    //
    //             // триггер для корзины
    //             if (typeof CartSettings != 'undefined' && prnt.hasClass(CartSettings.cartQtyClass))
    //                 $('.' + CartSettings.cartQtyClass).trigger(CartSettings.triggerChangeQty, [inp, v, prnt]);
    //
    //             if (typeof Ustanovka != 'undefined')
    //                 $(document).trigger('UstanovkaCalc', [inp, v, prnt]);
    //         }
    //
    //     });
    //     $('.kolvo input').change(function() {
    //         var inp     = $(this);
    //         var prnt    = inp.parents('.kolvo');
    //
    //         var v = parseInt(inp.val());
    //         if (v < 1) {
    //             v = 1;
    //             inp.val(v);
    //         }
    //         // триггер для корзины
    //         if (typeof CartSettings != 'undefined' && prnt.hasClass(CartSettings.cartQtyClass))
    //             $('.' + CartSettings.cartQtyClass).trigger(CartSettings.triggerChangeQty, [inp, v]);
    //     });
    //     this.inits.push('initKolvo');
    // },
    menuMainMobi: function() {
        if (!this.isMobile)
            return;
        var isVis = false;
        // $('.mobile-menu').width(this.screenW + 10);
        $('.mobile-menu .mm-open').click(function () {
            if (!isVis)
                $('.menu').slideDown(function(){
                    isVis = true;
                });
            else
                $('.menu').slideUp(function(){
                    isVis = false;
                });
        });
        $('.menu-wrap li.s').click(function (e) {
            e.preventDefault();

            $(this).children('.menu-sub').slideToggle();
        });
        this.inits.push('menuMainMobi');
    },
    scrollHandle: function() {
        return;
        var head = $('.head-wrap');
        var main = $('.main');
        var self = this;
        // if ($(window).scrollTop() > this.scrollTop) {
        //     this.headScrollHandle(head, main, true);
        // }
        // else {
        //
        //     this.headScrollHandle(head, main, false);
        // }

        // console.log(self.isMobile);
        $(document).scroll(function(){

            // console.log($(document).height());
            
            if (self.isMobile) {
                // $('.mobile-menu').css('top', '0px');
            }
        });
    },
    //увеличение изображений, библиотека fancybox
    initZoom: function() {
        $('.zoom').fancybox({
            wrapCSS    : 'fancybox-custom',
            closeClick : true,

            openEffect : 'none',

            helpers : {
                title : {
                    type : 'inside'
                },
                overlay : {
                    speedOut : 0
                }
            }
        });
        this.inits.push('initZoom');
    }
};

App.initTabs = function() {
    var self = this;
    if ($('.prod-tabs').length) {

        // $('.prod-tabs').ghoulTabs({
        //     button: $('.prod-tabs').children('li'),
        //     tabsWrap: $('.prod-tabs-content'),
        //     changeURL: true,
        //     activeTab: $('.prod-tabs li:first-child').data('tab'),
        //     tabsExtraHeight: {
        //         reviews: this.reviewsFormHeight
        //     }
        // });

        $('.prod-tabs-container').flexTabs({
            breakpoint: 760,
            beforeInit:  function() {
                if (!self.isMobile)
                    $('.prod-tabs-container .js-active-on-load').addClass('active');

            }
        });
    }




    this.inits.push('initTabs');
};


App.initActions = function(callback) {
    // var self = this;

    if ($('.brands-select').length) {
        var bsTitle = $('.brands-select .tit span');
        var bsTitleDef = bsTitle.html();

        var bsSelect = $('.brands-select .sel');
        bsTitle.click(function(){
            bsSelect.slideDown();
        });
        $('.brands-select .sel a').click(function(e) {
            e.preventDefault();
            var t = $(this).html();
            var id = $(this).data('id');

            bsTitle.find('span') . html(t);
            bsSelect.slideUp();

            $('.sovm-tbl').slideUp(100);
            $('.sovm-tbl.t' + id).slideDown();
        });

        $('.sovm-show-all').click(function(e) {
            e.preventDefault();
            // $('.sovm-tbl').hide();
            $('.sovm-tbl').slideDown();
            bsTitle.html(bsTitleDef);
        });
    }

    // $('.mm-title').html(this.screenW +'x' +$(window).height() +'/'+window.devicePixelRatio);



    this.inits.push('initActions');
    if (typeof callback == 'function')
        callback();
};


App.productGallery = function() {

    if (!$('.prod-gal').length)
        return;

    var imgCount = $('.prod-gal > *').length;
    if (!this.isMobile && imgCount < 5)
        return;
    $('.pg-arr').show();
    var slider = $('.prod-gal');
    slider.addClass('owl-carousel');
    slider.owlCarousel({
        items: 1,
        nav: false,
        slideSpeed: 500,
        navSpeed: 100,
        loop: true,
        margin: 10,
        dots: false,
        responsive: {
            350: {
                items: 2
            },
            500: {
                items: 4
            }

        }
    });
    $('.pg-arr.next').click(function () {
        slider.trigger('next.owl.carousel');
    });
    $('.pg-arr.prev').click(function () {
        slider.trigger('prev.owl.carousel');
    });
};
App.header = function() {
    if (this.isMobile)
        return;

    var head  = $('.header-fix');
    var header = $('header');
    var headHeight = head.outerHeight();

    var headerHeight = header.outerHeight();
    var topPos2FixedHead = headerHeight;
    var menuHeight = $('.menu-wrap').outerHeight();
    var bodyPTop = menuHeight + 100;

    
    console.log('head all Height: ' + headHeight  +' header:' + headerHeight + '/ bodyPTop: ' + bodyPTop);
    // head.addClass('fixed');
    // $('body').css('padding-top', bodyPTop);
    if ($(window).scrollTop() > topPos2FixedHead) {
        head.addClass('fixed');
        header.hide();
        $('body').css('padding-top', bodyPTop);
    }
    $(window).scroll(function() {
        if ($(window).scrollTop() > topPos2FixedHead) {
            if (!head.hasClass('fixed')) {
                //head.addClass('fixed');
                $('body').css('padding-top', bodyPTop);

                head.addClass('fixed');
                header.hide();
                // header.slideUp(function(){
                //     $('body').css('padding-top', bodyPTop);
                // });
            }
        }
        else if($(window).scrollTop() <= topPos2FixedHead / 2) {
            if (head.hasClass('fixed')) {
                head.removeClass('fixed');
                $('body').css('padding-top', 0);
                header.show();
            }
        }
    });
};


var ajaxActionRun = false;
function ajaxAction(_url, action, postData, callback, _showLoader, loaderText){

    var showLoader = _showLoader != undefined ? _showLoader : true;
    var lt = loaderText != undefined ? loaderText : '';
    var url = _url || '/ajax/';

    if(1 || !ajaxActionRun ){
        ajaxActionRun = true;

        if(showLoader)
            ajaxLoader(true, lt);

        $.ajax({
            type: 'POST',
            url: url,
            cache: false,
            data: {
                'action': action,
                'postData': postData
            }
        }).done(function (response){
            $data = $.parseJSON(response);
            //console.log(response);
            ajaxActionRun = false;

            try{
                if($data.error.length == 0){
                    if( typeof callback === 'function' )
                        callback($data);
                }
                else
                    dialogShow(1, $data.error);
            }
            catch(e){
                dialogShow(1, 'Ошибка парсинга JSON ' + e);
                ajaxLoader(false);
            }



        }).fail(function( jqXHR, textStatus, errorThrown ) {
                var txt = 'Код ошибки: "' + textStatus + '"<br />';
                txt += jqXHR.responseText;
                txt += ' Напишите администратору на <a href="mailto:service@air-box.ru?subject=Ошибка Ajax">service@air-box.ru</a> сообщите об ошибке: опишите свои действия и укажите страницу на которой она появляется.';

                //dialogShow('Ошибка AJAX-запроса', txt);

                ajaxActionRun = false;
                if( showLoader )
                    ajaxLoader(false);
            })
            .always(function() {
                ajaxActionRun = false;
                ajaxLoader(false);
            });
    }

}

$(document).ready(function(){
    $(document).on('click touchstart','.dialog-win .close, .js-dialog-close', function(){
        dialogHide(200);
    });
    $(document).click(function(e){
        // скрываем диалоговое окно
        if( !$('.dialog-win').is(e.target) && $('.dialog-win').has(e.target).length === 0 && DIALOG_VISIBLE ){
            dialogHide();
        }
    });
});
var DIALOG_VISIBLE = false;
function dialogHide( tout ){

    var win = $('.dialog-win');
    var bgr = $('#dialog-win-bgr');

    if( tout > 0 ){
        setTimeout(function(){
            win.fadeOut();
            bgr.fadeOut();
        }, tout);
    }
    else {
        win.fadeOut();
        bgr.fadeOut();
    }
    DIALOG_VISIBLE = false;

    win.removeAttr('style');
    $('.dialog-win .content').removeAttr('style');
}

function dialogShow( hdr, str, sizes, callback, addStyle ){
    var win  = $('.dialog-win');
    var cont = $('#dialog .content');
    var dHdr = $('#dialog .-hdr');

    win.removeAttr('class');
    win.attr('class', 'dialog-win');


    if (addStyle != undefined)
        win.addClass(addStyle);

    if (hdr == '') {
        dHdr.hide();
        cont.addClass('no-hdr');
    }
    else
        dHdr.show();
    if( hdr == 1)
        hdr = 'Ошибка';
    if( hdr == 2)
        hdr = 'Сообщение';

    dHdr.html( hdr );
    var txt = '';

    if (Array.isArray(str)) {
        str.forEach(function(item, i, arr) {
            txt += '<p>' + item + '</p>';
        });
    }
    else if( typeof str == 'object' ){

        for(var i in str) {
            txt += '<p>';
            if( typeof i == 'string' && !isFinite(i) )
                txt += i + ': ';
            txt += str[i] + '</p>';
        }
    }
    else
        txt = str;

    cont.html( txt );

    var sw = $(window).width();
    var sh = $(window).height();

    if( !win.is(':visible') ){

        if( sizes != undefined && sizes != null ) {
            win.width(sizes[0]);

            if (sizes[1] != undefined)
                win.height(sizes[1]);
        }
        //console.log('win outer width='+win.outerWidth());

        win.css({
            opacity: 0.01,
            left: (sw - win.outerWidth())/2 + 'px',
            top: (sh - win.outerHeight())/2 + 'px'
        }).show(function(){

            $('#dialog-win-bgr').fadeIn();

            var ww = win.outerWidth();
            var wleft = (sw - ww)/2;
            if (ww > sw ) {
                ww = sw;
                wleft = 0;
            }
            var top = (sh - win.outerHeight())/2;
            if (top < 0)
                top = 2;

            //console.log(wleft);

            win.css({
                width: ww,
                left:  wleft,
                top: top
            });
            win.animate({
                opacity: 1
            }, function(){

                //console.log('h=' +  win.outerHeight());
                if( win.outerHeight() > sh ){
                    win.height( sh - 10 + 'px');
                    win.css('overflow', 'hidden');
                    $('#dialog .content').css({
                        height: win.height() - 80 + 'px',
                        'overflow-y': 'scroll'
                    });
                }

                DIALOG_VISIBLE = true;
            });
        });


    }

    if ( typeof callback == 'function')
        callback();

}
function ajaxLoader( isShow, txt ){
    if( $('#ajax-loader') .length == 0)
        return;

    var self = $('#ajax-loader');
    if( txt != undefined && txt != '' )
        $('#ajax-loader div').html( txt );

    if( isShow ){
        self.css({
            left: ($(window).width() - self.width())/2 + 'px',
            top: ($(window).height() - self.height())/2 + 'px',
        }).show();
    }
    else
        self.hide();
}