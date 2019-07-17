const http = require('http');
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');


function processApiResponse(res, tableauServer, username, site) {
    let data = {
        ticket: '<ticket for \'' + username + '\'>'
    };

    let contents = JSON.stringify(data);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(contents + '\n');
    console.log('200 POST /api - ' + contents);
}

function processRequest(req, callback) {
    let chunks = [];
    req.on('data', (chunk) => {
        chunks.push(chunk);
    }).on('end', () => {
        let body = Buffer.concat(chunks).toString();
        callback(querystring.parse(body));
    });
}

http.createServer(function (req, res) {
   if (req.method === 'GET') {
       if (req.url === '/') {
           let contents = fs.readFileSync('index.html', 'ascii');
           res.writeHead(200, {'Content-Type': 'text/html'});
           res.end(contents);
           console.log('200 GET / - ' + contents.length);
       } else {
           res.writeHead(404);
           res.end('Not Found');
           console.log('404 GET ' + req.url);
       }
   } else if (req.method === 'POST') {
       if (req.url === '/api') {
           processRequest(req, function (data) {
               let site = null;
               console.log(' => ' + JSON.stringify(data));

               let url = new URL(data['share_link']);
               if (url.pathname.startsWith('/t/')) {
                   let tokens = url.pathname.split('/');
                   site = tokens[2];
               }

               processApiResponse(res, url.protocol + "//" + url.hostname, data['username'], site);
           });
       } else {
           res.writeHead(404);
           res.end('Not Found');
           console.log('404 POST ' + req.url);
       }
   } else {
       res.writeHead(405);
       res.end('Invalid request method: ' + req.method);
   }
}).listen(8080, '0.0.0.0');
