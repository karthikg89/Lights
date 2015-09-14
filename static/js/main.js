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
	authenticate(e.target.value);
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
		}
	});
}

authenticate();

})(jQuery);
