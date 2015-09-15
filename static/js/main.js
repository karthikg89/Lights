(function($) {
'use strict';


$('main').hide();
$('a').click(function(e) {
    e.preventDefault();
    $.ajax({
          url: e.target.href
    });
});

$('input').on('input', function(e) {
	if (e.target.value.length == 4) {
		authenticate(e.target.value);
	}
});

var authenticate = function(password) {
	$.ajax({
		url: "/api/auth",
		type: "POST",
		data: {
			password: password
		}

	}).done(function(data) {
		if (data.legit) {
			$('.login').addClass('hidden');
			$('.main').removeClass('hidden');
            setTimeout(function() {
                $('.login').css({'display': 'none'});
            }, 500);
			$('input').focusout();
		}
	});
}

authenticate();

})(jQuery);
