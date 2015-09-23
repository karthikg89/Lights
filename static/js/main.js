(function($) {
'use strict';

$('main').hide();
$('a').click(function(e) {
    e.preventDefault();
    $.ajax({
          url: e.target.href
    });
		$('#color_sliders').addClass('off');
		$('#brightness_slider').removeClass('off');
});

$('#picker').on('click', function(e) {
	$('#color_sliders').removeClass('off');
	$('#brightness_slider').addClass('off');
});

var prev = '';

$('input').on('input', function(e) {
	if (e.target.value.length == 4 && e.target.value !== prev) {
		authenticate(e.target.value);
	}
	prev = e.target.value;
});

$('#brightness_slider').on('change', function(e) {
	e.preventDefault();
	$.ajax({
		url: '/api/brightness/' + e.target.value
	});
});

$('#color_sliders input').on('change', function(e) {
	e.preventDefault();
	var color = parseInt($('#red').val()) << 16 | parseInt($('#green').val()) << 8 | parseInt($('#blue').val());
	$.ajax({
		url: '/api/color/' + color
	});
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
