const http = require('http');

http.createServer(function (req, res) {
   if (req.method === 'GET') {
       console.log('200 GET ' + req.url);
       res.writeHead(200, {'Content-Type': 'application/json'});
       res.end(JSON.stringify({ticket: 'TBD'}));
   } else {
       res.writeHead(405);
       res.end('Invalid request method: ' + req.method);
   }
}).listen(8080, '0.0.0.0');
