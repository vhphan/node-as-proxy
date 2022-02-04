const MySQLBackend = require("../db/MySQLBackend");

const getCookies = request => {
    let cookies = {};
    request.headers && request.headers.cookie && request.headers.cookie.split(';').forEach(function (cookie) {
        let parts = cookie.match(/(.*?)=(.*)$/)
        cookies[parts[1].trim()] = (parts[2] || '').trim();
    });
    return cookies;
};


const checkApi = async (apiKey, operator) => {
    let mySQLBackend;
    let sqlQuery;
    mySQLBackend = new MySQLBackend(operator);

    switch (operator) {
        case 'dnb':
            sqlQuery = "SELECT * FROM eproject_dnb.tbluser WHERE API_token = ? ORDER BY UserID DESC LIMIT 1";
            break;
        case 'celcom':
            sqlQuery =  "SELECT * FROM eproject_cm.tbluser WHERE API_token = ? ORDER BY UserID DESC LIMIT 1";
            break;
    }
    let numRows = await mySQLBackend.numRows(sqlQuery, [apiKey]);
    return !!numRows;
};

const auth = (operator) => {
    return async (req, res, next) => {
        const apiKey = req.headers['API'] || req.headers['api'] || getCookies(req)['API'] || req.query.api;
        if (!apiKey) {
            const err = new Error('No api key! You are not authenticated! Please login!')
            return res.status(401).json({
                error: err.message
            });
        }
        if (!(await checkApi(apiKey, operator))) {
            const err = new Error('Invalid API Key!')
            return res.status(401).json({
                error: err.message
            });
        }
        return next();
    };
}

module.exports = auth;