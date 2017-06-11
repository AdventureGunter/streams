/**
 * Created by User on 07.06.2017.
 */
let config = require('../config');

module.exports = function () {
    setInterval(() => {
        if (process.memoryUsage().heapUsed >= 1048576*config.memory.limit) /*console.log('memory usage error');*/throw new Error('memory usage error');
        console.log((process.memoryUsage().heapUsed / 1048576).toFixed(2) + ' mb');
    },config.memory.ms);
};



