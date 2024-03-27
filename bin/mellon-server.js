#!/usr/bin/env node
const { program } = require('commander');
const { start_server } = require('../index.js');
const fs = require('fs');

program
  .option('--host <host>','host','localhost')
  .option('--port <port>','port',8000)
  .option('--public <public>','public','public')
  .option('--registry <registry>','registry',null);

program.parse();

const options = program.opts();

if (options['registry']) {
  const path = options['registry'];
  options['registry'] = JSON.parse(fs.readFileSync(path,{ encoding: 'utf-8'}));
}

start_server(options);