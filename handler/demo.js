function handle(req,res,options) {
    res.writeHead(200);
    res.end(`Yeah! :) ${JSON.stringify(options)}`);
}

module.exports = { handle };