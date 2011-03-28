var mkdir = require('fs').mkdirSync,
    fs = require('fs'),
    path = require('path'),
    ejs = require('ejs');

var usage = 'Usage: restmvc app <app_name>\n';


function helpMessage() {
    console.info('Error: ' + usage);
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

    pathsToGenerate[appName] = { 'controllers': {}, 
                        'models': {}, 
                        'routes': {}, 
                        'tests': {'integration': {}}, 
                        'views': {},
                        'app.js': new FileTemplate(path.join(__dirname, 
                                'templates', 'app.js.ejs'),appName),
                        'Jakefile.js': new FileTemplate(path.join(__dirname,
                                    'templates', 'Jakefile.js.ejs'),appName)
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
}


exports.cli = function (argv) { 

    if ( argv.length != 2 ) {
        helpMessage();
    }
    
    var actions = {
        'app': function () {
            var appName = argv[1];
            createApp(appName);
        }
    };
    
    if ( argv[0] in actions )
        actions[argv[0]]();
    else
        helpMessage();
}
