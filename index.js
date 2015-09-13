var https = require('https');
var express = require('express');
var querystring = require('querystring');

var access_token = process.env.LED_ACCESS_TOKEN;

var app = express();

function post_data(i) {
	return querystring.stringify({
		access_token: access_token,
		comand: i
	});
}

function post_options(i) {
	return {
		hostname: "api.particle.io",
		port: 443,
		method: 'POST',
		path: "/v1/devices/53ff70066667574811370967/led",
		headers: {
         		'Content-Type': 'application/x-www-form-urlencoded',
          	'Content-Length': post_data(i).length
      	}
	};
}
		

app.get('/', function(req, res) {
	var request = https.request(post_options(100), function(res2) {
		res2.setEncoding('utf8');
      	res2.on('data', function (chunk) {
          	console.log('Response: ' + chunk);
     	});
		res.end();
	});
	request.write(post_data(100));
	request.end();
});

app.listen(8080);
