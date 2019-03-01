/**
 * Переключение вкладок по кнопкам
 * @copyright 31/10/2018 ghoul.ru
 * @version 1.2.0
 * - поддержка изменения размеров внутренних элементов, необходимо вызывать триггер
 *
 * @param Object _options - , настройки
 * @param function callback после того как вкладка становится активной
 * @param function callbackBtnClick - после клика на кнопке
 * @param function callbackInit
 */
(function( $ ){
    $.fn.ghoulTabs = function(_options, callback, callbackBtnClick, callbackInit) {

        var options = $.extend({
            button: null//кнопки - Object
            ,act: 'act'//класс активной кнопки - стиль
            ,tabsWrap: null//контейнер вкладок
            ,activeTab: null// активная вкладка - String,
            //,preventClick: false//обрубать все действия по клику, для ссылок,
            ,openTab: 'hash'//сделать активной вкладку по хешу/гет параметру в URL страницы, значения hash,get,
            ,speed: 400// скорость анимации,
            ,changeURL: false// изменять ЮРЛ страницы, добавлять хеш
            ,tabsExtraHeight: [] //доп высота, для каждого блока
            ,beforeClick: function() {return true;}
        }, _options);

        return this.each(function() {
            var GT = $(this);

            GT.activeTab = null;

            GT.btn = options.button;//для объекта

            //console.log(options.tabsExtraHeight);

            if (options.tabsWrap != null) {
                GT.tabsWrap = $(options.tabsWrap);
            }
            else {
                alert('ghoulTabs: Задайте св-во tabsWrap');
            }


            GT.btn.click(function(e) {
                var activeTabExists;

                if (!options.beforeClick($(this)))
                    return;

                var _this = $(this);
                if (_this.hasClass(options.act))
                    return;

                //console.log(_this);
                var tab = _this.data('tab');

                if (tab == undefined)
                    alert("ghoulTabs: Задайте кнопке уникальное св-во data-tab");

                var openTab = GT.tabsWrap.find('#tab-' + tab);

                if (openTab == undefined)
                    alert('ghoulTabs: Не найдена вкладка с ID=tab-' + openTab);

                if (GT.activeTab != null && GT.activeTab.length > 0)
                    activeTabExists = true;
                else
                    activeTabExists = false;

                //if (GT.activeTab != null && GT.activeTab.length > 0) {
                {

                    GT.btn.each(function () {
                        $(this).removeClass(options.act);
                    });

                    if (activeTabExists)
                        GT.activeTab.fadeOut(options.speed, function () {
                            GT.activeTab.removeClass(options.act);

                            _this.addClass(options.act);
                        });
                    else
                        _this.addClass(options.act);

                    openTab.fadeIn(options.speed, function () {
                        openTab.addClass(options.act);
                        GT.activeTab = openTab;
                        cb();
                    });
                    var tabHeight = openTab.outerHeight();
                    if (options.tabsExtraHeight[tab] != undefined)
                        tabHeight += options.tabsExtraHeight[tab];

                    GT.tabsWrap.animate({
                        height: tabHeight
                    }, options.speed);

                    /**
                     * Меняет хеш страницы
                     * @since 1.1.7
                     */
                    if (options.changeURL)
                        history.pushState({}, '', window.location.href.split('#')[0] + '#tab-' + tab);


                    /**
                     * @since 1.1.6
                     */
                    if (typeof callbackBtnClick == 'function' )
                        callbackBtnClick($(this), GT.activeTab);
                }


            });



            setActiveTab();
            init();
            function init() {

                GT.tabsWrap.css('position', 'relative');

                // ищем всех прямых потомков
                GT.tabsWrap.children().css({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%'
                }).hide();


                if (options.activeTab == null)
                    options.activeTab = GT.tabsWrap.children(GT.tabs).eq(0).attr('id').replace('tab-', '');


                if (options.activeTab != undefined && options.activeTab != null) {
                    GT.btn.each(function () {
                        if ($(this).data('tab') == options.activeTab)
                            $(this).addClass(options.act);
                    });

                    GT.activeTab = GT.tabsWrap.find('#tab-' + options.activeTab);

                    if (GT.activeTab.length) {
                        GT.activeTab.css('opacity', 1).show();

                        GT.tabsWrap.height(GT.activeTab.outerHeight());

                    }

                    /**
                     * @since 1.1.8
                     */
                    if (typeof callbackInit == 'function' )
                        callbackInit(GT.activeTab);
                }

            }

            /**
             * Устанавливает активую вкладку елси в ЮРЛ найден параметр "tab"
             */
            function setActiveTab() {

                if (options.openTab == 'hash' && /tab/.test(window.location.hash)) {
                    var hash = (window.location.hash).replace('#tab-', '');
                    if (hash != '')
                        options.activeTab = hash;
                }
                else {
                    var gp = getSearchParameters();
                    //console.log(gp);

                    if (gp.tab != undefined)
                        options.activeTab = gp.tab;
                }


            }

            function getSearchParameters() {
                var prmstr = window.location.search.substr(1);
                return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
            }

            function transformToAssocArray(prmstr) {
                var params = {};
                var prmarr = prmstr.split("&");
                for (var i = 0; i < prmarr.length; i++) {
                    var tmparr = prmarr[i].split("=");
                    params[tmparr[0]] = tmparr[1];
                }
                return params;
            }


            function cb() {
                if (typeof callback == 'function') {
                    var cbData = {
                        self: GT,
                        activeTab: GT.activeTab
                    };


                    callback(cbData);
                }
            }

            $(document).on('ghoulTabsOnResize', GT, function(e){
                if (typeof e.height != 'undefined')
                    GT.tabsWrap.animate({
                        height: GT.activeTab.outerHeight() + e.height
                    }, options.speed);
            });



        });
    }
})( jQuery );


/**
 * Перключатель, горизонтальный
 * @copyright 15/05/2018 ghoul.ru
 * @version 1.0
 */
(function( $ ) {
    $.fn.ghoulSwitcher = function (_options, callback) {

        var options = $.extend({
            knob: '',//дочерний элемент кот. двигается
            onClass: 'on',//класс, когда включено - knob справа
            offClass: 'off',//класс, когда выключено - knob слева
            speed: 400,// скорость анимации,
            posDelta: 0//отступы с обеих сторон
        }, _options);

        return this.each(function() {
            var self, knob, knobWidth, switcherWidth, posOn, turnOn, canClicked;

            self = $(this);
            knob = self.children(options.knob);
            knobWidth = knob.outerWidth();
            switcherWidth = $(this).width();
            posOn = switcherWidth - knobWidth - options.posDelta;
            canClicked = true

            var onSwitch = function(turnOn) {

                if (turnOn)
                    self.removeClass(options.offClass).addClass(options.onClass);
                else
                    self.removeClass(options.onClass).addClass(options.offClass);

                canClicked = true;
                if (typeof callback == 'function') {
                    callback(turnOn);
                }
            };


            //переключение
            if (canClicked) {
                self.click(function () {
                    canClicked = false;
                    turnOn = !self.hasClass(options.onClass);


                    //с анимацией
                    if (options.speed > 0)
                        knob.animate({
                                left: turnOn ? posOn : (0 + options.posDelta)
                            },
                            options.speed,
                            function () {
                                onSwitch(turnOn);
                            }
                        );
                    //без анимации
                    else
                        onSwitch(turnOn);
                });
            }



        });


    }
})( jQuery );