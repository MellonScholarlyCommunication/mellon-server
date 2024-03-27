function handle(req,res) {
    res.writeHead(200);
    res.end('Yeah! :)');
}

module.exports = { handle };