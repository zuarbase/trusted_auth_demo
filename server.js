const http = require('http');
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');


function processApiResponse(res, tableauServer, username, site) {
    let url = new URL(tableauServer + '/trusted');
    let body = {
        username: username
    };
    if (site) {
        body['target_site'] = site;
    }

    let postData = querystring.stringify(body);
    console.log(' => POST ' + url + ' ' + postData);

    let module = http;
    if (url.protocol === 'https:') {
        module = https;
    }

    let req = module.request({
        method: 'POST',
        hostname: url.hostname,
        path: '/trusted',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, function (tableauServerResponse) {
        let ticketData = '';
        tableauServerResponse.on('data', function (chunk) {
            ticketData += chunk;
        });

        tableauServerResponse.on('end', function () {
            let contents = JSON.stringify(
                {
                    ticket: ticketData
                });
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(contents + '\n');
            console.log('200 POST /api - ' + contents);
        });
    });

    req.on('error', function (error) {
        console.log('ERROR: ' + error);
    });

    req.write(postData);
    req.end();
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
