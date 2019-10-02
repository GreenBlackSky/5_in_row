let http = require('http');
let fs = require('fs');
let url = require('url');


function connectionHandler(request, response) {

    function answerWithFile(connectionType, fileName) {
        response.writeHead(200, {"Content-type": connectionType});
        response.write(fs.readFileSync(fileName, null));
        response.end();
    }

    let path = url.parse(request.url);

    switch(path.pathname) {
        case '/':
            answerWithFile("text/html", './index.html');
            break;
        case '/script.js':
            answerWithFile("text/javascript", './script.js');
            break;
        case '/styles.css':
            answerWithFile("text/css", './styles.css');
            break;
        case '/config.json':
            answerWithFile('text/json', './config.json');
            break;
        default:
            // TODO create HTML page for no page scenario
            response.writeHead(200, {"Content-type": "text/plain"});
            response.end("No such page");
            break;
    }
}


http.createServer(connectionHandler).listen(8000);
