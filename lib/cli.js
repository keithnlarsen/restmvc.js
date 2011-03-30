var mkdir = require('fs').mkdirSync;
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var usage = 'Usage: restmvc app <app_name>\n       restmvc model <model_name>\n';

function helpMessage() {
    console.info(usage);
    process.exit(1);
}

var FileTemplate = function (templatePath, appName) { 
    this.templatePath = templatePath;
    this.appName = appName;
};

FileTemplate.prototype.render = function(path) {
    var str = fs.readFileSync(this.templatePath, 'utf8');
    str = ejs.render(str, {"locals": {"appName": this.appName}});
    fs.writeFileSync(path, str);
};

function createApp(appName) {
    var pathsToGenerate = {};

    pathsToGenerate[appName] = {
        'controllers': {},
        'models': {},
        'routes': {},
        'tests': {
            'integration': {},
            'unit': {}
        },
        'views': {
            '500.jade': new FileTemplate(path.join(__dirname, 'templates', '500.jade.ejs'),appName),
            'resterror.jade': new FileTemplate(path.join(__dirname, 'templates', 'resterror.jade.ejs'),appName),
            'layout.jade': new FileTemplate(path.join(__dirname, 'templates', 'layout.jade.ejs'),appName)
        },
        'app.js': new FileTemplate(path.join(__dirname, 'templates', 'app.js.ejs'),appName),
        'Jakefile.js': new FileTemplate(path.join(__dirname, 'templates', 'Jakefile.js.ejs'),appName)
    };

    function generatePaths(pathSoFar, toGenerate) {
        var currentPath,
            paths = Object.keys(toGenerate);

        if ( paths ) {
            paths.forEach(function (name) {
                currentPath = path.join(pathSoFar, name);
                if ( toGenerate[name] instanceof FileTemplate ) {
                    toGenerate[name].render(currentPath);
                    return;
                }
                try {
                    mkdir(currentPath, 0755);
                } catch (e) {
                    console.error("Error creating " + currentPath + "\n" + 
                        e.message);
                }
                generatePaths(currentPath, toGenerate[name]);
            });
        }
    }
        
    generatePaths('.', pathsToGenerate);
};

function createModel(modelName) {
    var str = fs.readFileSync(path.join(__dirname, 'templates', 'model.js.ejs'), 'utf8');
    str = ejs.render(str, {"locals": {"modelName": modelName}});
    fs.writeFileSync('./models/' + modelName + '.js', str);
};

exports.cli = function (argv) {
    if ( argv.length != 2 ) {
        helpMessage();
    }
    
    var actions = {
        'app': function () {
            var appName = argv[1];
            createApp(appName);
        },
        'model': function() {
            var modelName = argv[1];
            createModel(modelName);
        }
    };
    
    if ( argv[0] in actions )
        actions[argv[0]]();
    else
        helpMessage();
};
