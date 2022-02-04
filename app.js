const express = require('express');

const cors = require('cors');
const {createProxyMiddleware} = require("http-proxy-middleware");

const errorHandler = require('./middleware/error');
const result = require('dotenv').config({path: './.env'});
const {logger} = require("./middleware/logger");
const auth = require("./middleware/auth");

const app = express();
const port = 3002;

if (result.error) {
    throw result.error;
}
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(auth('dnb'))
// Proxy endpoints
let proxyMiddleware = createProxyMiddleware({
    changeOrigin: true,
    prependPath: false,
    // pathRewrite: {
    //     [`^/node/jlab2`]: '',
    // },
    target: "http://localhost:8080",
    ws: true,
    // pathRewrite: {
    //     '^/socket': '',
    // },
    logLevel: 'debug'
});
app.use('/', proxyMiddleware);
app.use(errorHandler);


const server = app.listen(port,
    () => {
        console.log(`listening on ${port}`);
        logger.info(
            'test'
        );
    }
);

server.on('upgrade', proxyMiddleware.upgrade);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`.red);
    logger.error(err.stack);
});
