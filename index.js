var https = require('https');
var express = require('express');
var querystring = require('querystring');
var session = require('express-session');
var bodyParser = require('body-parser');

var access_token = process.env.LED_ACCESS_TOKEN;
var cookie_secret = process.env.LED_COOKIE_SECRET;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	name: "kgizzle",
  secret: cookie_secret,
	cookie: {
		maxAge: 3600000
	},
	resave: false,
	saveUninitialized: true
	}
));
app.use(express.static('static'));

function post_data(i) {
    return querystring.stringify({
        access_token: access_token,
        command: i
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

function genuuid() {
	return new Date().getTime();
}

app.use('/api/auth', function(req, res) {
	var sess = req.session;
	if (req.body.password === process.env.LED_KEYCODE) {
		sess.authenticated = true;
	}
	return res.send({
		legit: !!sess.authenticated
	});
});

app.get('/api/:id?', function(req, res) {
		if (!req.session.authenticated) {
			return res.send(400);
		}

    var id = !isNaN(req.params.id) ? req.params.id : 100;
    var request = https.request(post_options(id), function(res2) {
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
        res.end();
    });
    request.write(post_data(id));
    request.end();
});

app.listen(8080);
