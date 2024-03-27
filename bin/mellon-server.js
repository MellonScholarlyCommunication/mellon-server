#!/usr/bin/env node
const { program } = require('commander');
const { start_server } = require('../index.js');

program
  .option('--host <host>','host','localhost')
  .option('--port <port>','port',8000)
  .option('--public <public>','public','public');

program.parse();

const options = program.opts();

//options['registry'] = [
//  { path: 'inbox/.*' , do: function(req,res) {
//      res.writeHead(200);
//      res.end('ok');
//  }}
//];

start_server(options);