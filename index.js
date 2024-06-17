const http = require('http');
const fs = require('fs');

let host = 'localhost';
let port = 8000;
let public_dir = './public';
let base = undefined;
let registry = [] ;

const log4js = require('log4js');
const logger = log4js.getLogger();

log4js.configure({
    appenders: {
      stderr: { type: 'stderr' }
    },
    categories: {
      default: { appenders: ['stderr'], level: process.env.LOG4JS ?? 'INFO' }
    }
});

const requestListener = function (req, res) {
    const pathItem = req.url.substring(1);
    const address = req.socket.address()['address'];

    try {
        const reg = registryEntry(pathItem);

        if (reg) {
            reg(req,res);
            logger.info(`${address} - ${req.method} ${req.url} [${res.statusCode}] 0`);
            return;
        }
        else {
            const exists = fs.existsSync(`${public_dir}/${pathItem}`);

            if (!exists) {
                res.writeHead(404);
                res.end(`No such path: ${pathItem}`);
                logger.info(`${address} - ${req.method} ${req.url} [404] 0`);
                return;
            }
        }

        const stat = fs.lstatSync(`${public_dir}/${pathItem}`);
        if (stat && stat.isFile()) {
            doFile(`${public_dir}/${pathItem}`,req,res);
        }
        else if (stat && stat.isDirectory()) {
            doDir(`${public_dir}/${pathItem}`,pathItem,req,res); 
        }
        else {
            res.writeHead(404);
            res.end(`No such path: ${pathItem}`);
            logger.info(`${address} - ${req.method} ${req.url} [404] 0`);
        }
    }
    catch(e) {
        res.writeHead(500)
        res.end(e.message);
        logger.info(`${address} - ${req.method} ${req.url} [500] 0`);
    }
}

function registryEntry(pathItem) {
    try {
        for (let i = 0 ; i < registry.length ; i++) {
            let regex = new RegExp('^' + registry[i]['path']);
        
            if (regex.test(pathItem)) {
                const entry = registry[i]['do'];

                if (typeof entry === 'function') {
                    return entry;
                }
                else {
                    logger.info(`loading entry ${entry}`);
                    delete require.cache[entry];
                    const func = require(entry).handle;
                    registry[i]['do'] = func;
                    return func;
                }
            }
        }
    }
    catch (e) {
        logger.error(e);
    }

    return null;
}

function doFile(path,req,res) {
    const content = fs.readFileSync(path, { encoding: 'utf-8'});
    if (fs.existsSync(`${path}.meta`)) {
        const headers = JSON.parse(fs.readFileSync(`${path}.meta`, { encoding : 'utf-8'}));
        Object.keys(headers).forEach( (key) => {
            res.setHeader(key, headers[key]);
        });
    }
    res.writeHead(200);
    res.end(content);
    logger.info(`${req.method} ${req.url} [200] ${content.length}`);
}

function doDir(path,pathItem,req,res) {
    const hasIndex = fs.existsSync(`${path}index.html`);

    if (hasIndex) {
        return doFile(`${path}index.html`,req,res);
    }

    const lsDir = fs.readdirSync(path);

    if (fs.existsSync(`${path}.meta`)) {
        const headers = JSON.parse(fs.readFileSync(`${path}.meta`, { encoding : 'utf-8'}));
        Object.keys(headers).forEach( (key) => {
            res.setHeader(key, headers[key]);
        });
    }
    else {
        res.setHeader('Content-Type','text/html');
    }

    let content = '<html><body>';
    let baseUrl = base ? base : "http://${host}:${port}";

    lsDir.forEach( (entry) => {
        content += `<a href="${baseUrl}/${pathItem}${entry}">${entry}</a><br>`
    });
    content += '</body></html>';
    res.writeHead(200);
    res.end(content);
    logger.info(`${req.method} ${req.url} [200] ${content.length}`);
}

function start_server(options) {
    port = options['port'] ?? 8000 ;
    host = options['host'] ?? localhost ;
    base = options['base'];
    public_dir = options['public'] ?? './public'; 

    if (options['registry']) {
        registry = options['registry'];
    }

    const server = http.createServer(requestListener);

    server.listen(port, host, () => {
        logger.info(`Server is running on http://${host}:${port} for ${public_dir}`);
    });
}

module.exports = { start_server , doFile , doDir };
