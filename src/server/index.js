const express = require('express');
const app = express();
const connectMongoWithRetry = require('./helpers/mongoose.helper');
const logger = require('./helpers/logging.helper');
const config = require('./config/main');

// serve static files
app.use(express.static('dist'));
app.use('/static', express.static('static'));

// connect to mongo
connectMongoWithRetry();

// routes
var auth = require('./route/auth');
var profile = require('./route/profile.js');
var books = require('./route/books.js');
var instantsearch = require('./route/instantsearch.js');
var categories = require('./route/categories.js');
var recentlyadded = require('./route/recentlyadded');
var mostview = require('./route/mostview');
var mostdownload = require('./route/mostdownload');
var downloadebook = require('./route/downloadebook');
var booksAdmin = require('./route/admin/books.admin.js');
var usersAdmin = require('./route/admin/users.admin.js');

app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/books', books);
app.use('/api/instantsearch', instantsearch);
app.use('/api/categories', categories);
app.use('/api/recentlyadded', recentlyadded);
app.use('/api/mostview', mostview);
app.use('/api/mostdownload', mostdownload);
app.use('/api/downloadebook', downloadebook);
app.use('/api/admin/books', booksAdmin);
app.use('/api/admin/users', usersAdmin);

// handle 404
app.get('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

// start server
app.listen(config.app.port, () => logger.log('info', 'Listening on port ' + config.app.port));
