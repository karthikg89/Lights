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
		maxAge: null
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

function post_options(i,func) {
    return {
        hostname: "api.particle.io",
            port: 443,
            method: 'POST',
            path: "/v1/devices/53ff70066667574811370967/" + func,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data(i).length
            }
    };
}

var keycode = process.env.LED_KEYCODE;

app.use('/api/auth', function(req, res) {
	var sess = req.session;
	if (req.body.password === keycode) {
		sess.authenticated = true;
	}
	return res.send({
		legit: !!sess.authenticated
	});
});

app.get('/api/color/:id?', function(req, res) {
	if (!req.session.authenticated) {
	  return res.sendStatus(400);
	}
	
	var id = !isNaN(req.params.id) ? req.params.id : "0";
  var request = https.request(post_options(id, "color"), function(res2) {
    res2.setEncoding('utf8');
    res2.on('data', function(chunk) {
      console.log('Color Response: ' + chunk);
    });
    res.end();
  });

  request.write(post_data(id, 'color'));
  request.end();	
});

app.get('/api/brightness/:id?', function(req, res) {
	if (!req.session.authenticated) {
		return res.sendStatus(400);
	}

	var id = !isNaN(req.params.id) ? req.params.id : 1;
	var request = https.request(post_options(id, "brightness"), function(res2) {
		res2.setEncoding('utf8');
		res2.on('data', function(chunk) {
			console.log('Brightness Response: ' + chunk);
		});
		res.end();
	});
	
	request.write(post_data(id, 'brightness'));
	request.end();
});

app.get('/api/:id?', function(req, res) {
		if (!req.session.authenticated) {
			return res.sendStatus(400);
		}

    var id = !isNaN(req.params.id) ? req.params.id : 100;
    var request = https.request(post_options(id, "led"), function(res2) {
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            console.log('State Response: ' + chunk);
        });
        res.end();
    });
    request.write(post_data(id, 'led'));
    request.end();
});

app.listen(8080);
