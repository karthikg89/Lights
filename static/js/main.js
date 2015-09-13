(function($) {
'use strict';

$('a').click(function(e) {
    e.preventDefault();
    $.ajax({
          url: e.target.href
    });
});
})(jQuery);
