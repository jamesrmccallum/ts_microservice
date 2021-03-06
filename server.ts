var fs = require('fs');
import * as express from 'express'
import { stringify } from 'querystring';
import { IncomingHttpHeaders } from "http";
var app = express();

if (!process.env.DISABLE_XORIGIN) {
  app.use(function (req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if (!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(origin);
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

function formatDate(date: Date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getUTCDate();
  var monthIndex = date.getUTCMonth();
  var year = date.getUTCFullYear();

  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  })


app.route('/tsservice/:date')
  .get(function (req, res) {

    let params: { date: string } = req.params;
    let dt = undefined;

    let result: { unix: null | number, natural: null | string } = {
      unix: null,
      natural: null
    }

    // if param is numeric
    if (!isNaN(parseInt(params.date))) {
      dt = new Date(parseInt(params.date) * 1000);

      // Otherwise we'll try parsing it as a date
    } else {
      dt = Date.parse(params.date);
      if (isNaN(dt)) {
        res.type('txt').send(JSON.stringify(result))
      }
    }

    result.unix = (<Date>dt!).getTime() / 1000

    result.natural = formatDate(<Date>dt!)

    res.type('txt').send(JSON.stringify(result))
  })

function parseHeaders(headers: IncomingHttpHeaders) {

  if (headers['user-agent']) {
    var { os, ip } = parseUserAgent(<string>headers['user-agent'])
  }

  return {
    os: os || 'unknown',
    ip: ip || 'unknown',
    language: <string>headers['accept-language'] || 'unknown'
  }
}

function parseUserAgent(userAgent: string) {

  let osMatches = userAgent.match(/\(([^()]+)\)/);
  let ipMatches = userAgent.match(/\d{1,4}\.\d{1,4}\.\d{1,4}\.\d{1,4}/)

  return {
    os: osMatches ? osMatches[0] : undefined,
    ip: ipMatches ? ipMatches[0] : undefined
  }
}

app.route('/headers')
  .get((req, res) => {
    let headers = JSON.stringify(parseHeaders(req.headers))
    res.type('txt').send(headers)
  })

// Respond not found to all the wrong routes

app.use(function (req, res, next) {
  res.status(404);
  res.type('txt').send("That's not a valid route. Sorry!");
});

// Error Middleware
app.use(function (err, req, res, next) {
  if (err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

