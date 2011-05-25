var sys = require('sys');
var reporters = require('nodeunit').reporters;

desc('Run applicaiton with full debug information turned on.');
task('debug', [], function () {
    console.log('Starting Nodejs Server');

    process.env.NODE_ENV = 'debug';

    var app = require('./app');
    app.listen(3000);
    console.log('Server running at http://127.0.0.1:3000/' + ' in debug mode.\r');
});

desc('Run application in release mode with minimal debug information.');
task('release', [], function () {
    console.log('Starting Nodejs Server');

    process.env.NODE_ENV = 'release';

    var app = require('./app');
    app.listen(3000);
    console.log('Server running at http://127.0.0.1:3000/' + ' in release mode.\r');
});

desc('Run the applications integration tests.');
task('test', [], function () {
    console.log('Starting Nodejs');

    process.env.NODE_ENV = 'test';

    var app = require('./app');

    app.listen(3000);
    console.log('Running testing server at http://127.0.0.1:3000/' + '\r');

    // Delay to make sure that node server has time to start up on slower computers before running the tests.
    setTimeout( function(){
        require.paths.push(__dirname);

        var testRunner = reporters.default;

        process.chdir(__dirname);

        console.log('Running integration tests.');
        testRunner.run(['tests/integration']);
    }, 250);
});
