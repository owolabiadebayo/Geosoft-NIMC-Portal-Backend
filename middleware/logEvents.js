const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Use `/tmp` directory for all logs
const LOG_DIR = '/tmp';

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        // Ensure the log directory exists
        if (!fs.existsSync(LOG_DIR)) {
            await fsPromises.mkdir(LOG_DIR, { recursive: true });
        }

        // Write to the log file
        const logPath = path.join(LOG_DIR, logName);
        await fsPromises.appendFile(logPath, logItem);
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
};

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin || 'unknown'}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
};

module.exports = { logger, logEvents };
