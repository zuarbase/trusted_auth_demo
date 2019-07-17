const http = require('http');
const fs = require('fs');

function processApiResponse(res, tableauServer, username) {
    let data = {
        ticket: '<ticket for \'' + username + '\'>'
    };

    let contents = JSON.stringify(data);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(contents + '\n');
    console.log('200 POST /api - ' + contents);
}

http.createServer(function (req, res) {
   if (req.method === 'GET') {
       if (req.url === '/') {
           let contents = fs.readFileSync('index.html', 'ascii');
           res.writeHead(200, {'Content-Type': 'text/html'});
           res.end(contents);
           console.log('200 GET / - ' + contents.length);
       } else if (req.url == '/api') {
	       processApiResponse(res, "http://localhost", "smith");
       } else {
           res.writeHead(404)
           res.end("Not Found");
           console.log('404 GET ' + req.url);
       }
   } else {
       res.writeHead(405);
       res.end('Invalid request method: ' + req.method);
   }
}).listen(8080, '0.0.0.0');