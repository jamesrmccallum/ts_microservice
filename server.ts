var fs = require('fs');
import * as express from 'express'
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


app.route('/:date')
  .get(function (req, res) {

    let params: { date: string } = req.params;
    let dt = undefined;

    // if param is numeric
    if (!isNaN(parseInt(params.date))) {
      dt = new Date(parseInt(params.date) * 1000);
    } else {
      try {
        dt = new Date(params.date);
      }
      catch (e) {
        res.status(e.status || 500).type('txt').send(e.message || 'Invalid Date')
      }
    }

    let result = {
      unix: dt.getTime() / 1000,
      natural: formatDate(dt)
    }

    res.type('txt').send(JSON.stringify(result))
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
