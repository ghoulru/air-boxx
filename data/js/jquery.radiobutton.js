/**
 * Имитация radio/chekbox кнопок
 *
 * HTML код кнопки:
 * <div class="js-cart-btn">  - любой контенейр
 *   <div class="radio"> - имитация кружка/квадрата
 *     <input type="radio" name="buttonName" value="value" id="buttonID"> - релаьное значение
 *   </div>
 *   <label for="buttonID"> -  необязательно
 *    Наличными курьеру
 *   </label>
 * </div>
 *
 * @version 2.0
 * @copyright 01/04/2017 ghoul.ru
 */
(function( $ ){
    $.fn.radioButton = function(_options, callback) {

        var options = $.extend({
            /**
             * блок самой кнопки имитации input
             * наименование класса
             */
            button: '.radio',
            /**
             * блок имитации label
             */
            label: 'label',
            /**
             * Класс кнопки когда отмечена
             */
            checked: 'checked',
            /**
             * Аттрибут data-*dataName* у input внутри options.button
             */
            dataName: 'text',
            /**
             * Класс когда мышка поверх кнопки и/или label'а
             */
            buttonHover: 'hover'
        }, _options);

        return this.each(function() {

            var self = $(this);


            /**
             * Объект имитации инпута
             */
            var radioBtn = self.find(options.button);
            rbHover(radioBtn);

            /**
             * Объект имитации label
             */
            if ( options.label != null ) {
                var radioLabel = self.find(options.label);
                rbHover(radioLabel);
            }
            /**
             * Сам инпут
             */
            var realInput = radioBtn.find('input');

            //скрываем реальную кнопку
            realInput.hide();
            /**
             * Тип кнопки
             */
            var inputType = realInput.attr('type');
            var inputName = realInput.attr('name');
            var inputValue = realInput.val();
            var inputData = realInput.data(options.dataName);

            /**
             * Имитация HOVER
             * @param obj
             */
            function rbHover(obj) {
                obj.hover(function(){
                    radioBtn.addClass(options.buttonHover);
                }, function(){
                    radioBtn.removeClass(options.buttonHover);
                });
            }

            /**
             * Клик по блокам
             */
            radioLabel.on('click', function(e){
                var btn;
                e.stopImmediatePropagation();
                e.preventDefault();
                if (e.btn != undefined)
                    btn = e.btn;
                else
                    btn = radioBtn;
                toggleCheck(btn);
            });
            radioBtn.on('click', function(e){
                e.stopImmediatePropagation();
                e.preventDefault();
                radioLabel.trigger({
                    type: 'click',
                    btn: $(this)
                });
            });


            function toggleCheck(button) {

                //console.log(button);
                var isChecked = realInput.is(':checked');
                /**/
                console.clear();
                console.log('toggleCheck > isChecked=' + isChecked + ' / inputType=' + inputType);
                /*if (DEBUG) {
                    glog(inputType, 1);
                    glog('is checked '+(isChecked ? 1: 0));
                    glog(inputName);
                }*/

                //console.log('isChecked: ' + isChecked);
                //console.log('inputType: '+inputType);
                /**/

                var result = null;
                if (inputType == 'radio') {
                    if (!isChecked) {
                        //у остальных кнопок убираем класс checked
                        $('input[name=' + inputName + ']').each(function(){
                            $(this).parent(options.button).removeClass(options.checked);
                        });
                        radioBtn.addClass(options.checked);
                        realInput.prop( "checked", true);
                        result = true;
                    }
                }
                //checkbox
                else {
                    result = !isChecked;

                    if (isChecked)
                        radioBtn.removeClass(options.checked);
                    else
                        radioBtn.addClass(options.checked);

                    realInput.prop("checked", !isChecked);
                }

                cb(result);

                return result;

            }

            function cb(isChecked) {
                if (typeof callback == 'function') {
                    var cbData = {
                        name: inputName,
                        value: inputValue,
                        type: inputType,
                        checked: isChecked,
                        self: self
                    };
                    cbData[ options.dataName ] = inputData;

                    callback(cbData);
                }
            }
        });

    }
})( jQuery );
