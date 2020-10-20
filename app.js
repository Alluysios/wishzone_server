const express = require('express');
const app = express();
const helmet = require('helmet')
const cors = require('cors');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// ROUTES
const productRoutes  = require('./api-routes/product');
const reviewRoutes  = require('./api-routes/review');
const userRoutes = require('./api-routes/user');
const authRoutes = require('./api-routes/auth');

app.enable('trust proxy');
/*
==================
MIDDLEWARE
==================
*/

app.use(cors());
app.options('*', cors());

// Secure http headers
app.use(helmet());
// Data sanitazation
app.use(xss());
app.use(cookieParser());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution (1 >) (ex: price=250, price=200)
app.use(
    hpp({
        whitelist: [
            'price',
            'category',
            'name'
        ]
    })
);
// Serve static files
app.use('/uploads', express.static('uploads'))
// Body parser, reading data from the body into the req.body (limit 10kb)
app.use(express.json({ limit: '10kb' }));
// parse data from urlencoded form (files), {extended: true} = pass complex data
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

if(process.env.NODE_ENV === 'production') {
    // Serve static files
    app.use(express.static("client/build"));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

module.exports = app;