/**
 * Рейтинг в виде звезд
 */
(function( $ ){
    $.fn.ghoulRating = function(_options) {

        var options = $.extend({
            min: 1
            ,max: 5
            ,def: 0//значение по умолчанию
            ,active: 'act'//класс отмеченной звезды
            ,nonStaticClass: 'vote' //статический - не изменяется
            ,onSelect: null
        }, _options);


        function hoverRating(ratinObj, i) {
            ratinObj.children('*').each(function(){
                if ($(this).index() <= i)
                    $(this).addClass('act');
                else
                    $(this).removeClass('act');
            });
        }



        return this.each(function() {
            var self = $(this);
            var min = self.data('min') != undefined ? parseInt(self.data('min')) : options.min;
            var max = self.data('max') != undefined ? parseInt(self.data('max')) : options.max;
            var def = self.data('def') != undefined ? parseInt(self.data('def')) : options.def;
            var isStatic = !self.hasClass(options.nonStaticClass);
            var setRating = def;

            var star = '<i></i>';
            for (var i=1; i <= max; i++) {
                star = $('<i></i>');
                star.appendTo(self);
                if (i <= def)
                    star.addClass(options.active)
            }

            if (!isStatic) {
                self.children('*').mouseenter(function () {
                    hoverRating(self, $(this).index());
                });

                self.children('*').mouseleave(function () {
                    hoverRating(self, -1);
                    //hoverRating(self, (setRating-1));
                });
                self.mouseleave(function () {
                    hoverRating(self, (setRating - 1));
                });
                self.children('*').click(function () {
                    setRating = $(this).index() + 1;
                    hoverRating(self, (setRating - 1));
                    if (typeof options.onSelect == 'function')
                        options.onSelect(self, setRating);
                });
            }

        });


    }
})( jQuery );