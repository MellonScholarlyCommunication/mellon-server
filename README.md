# mellon-server

A small experimental hackable HTTP server.

## Install

```
npm install mellon-server
```

## Run server

```
npx mellon-server
```

## Hackable

```
const { start_server } = require('mellon-server');

start_server({
    host: 'localhost',
    port: 8000,
    public: './public',
    base: 'https://my.base.url/service',
    registry: [
       { path: 'demo' , do: doDemo },
       { path: 'test/.*', do: './hander/demo.js'}
    ]
});

function doDemo(req,res) {
    res.writeHead(200);
    res.end('Hello World!');   
}
```

All files in the `public` directory will be served to the world. Directories and files can have a `.meta` JSON file which contains extra HTTP headers that should be added to the HTTP response.

