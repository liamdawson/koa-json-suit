# koa-json-suit
Dress up your JSON API output and output errors consistently.

## Installation

    npm install --save koa-json-suit
    
## Usage

    app.use(require('koa-json-suit')(config));

## API

### ctx.respond(obj)
The middleware injects a `respond` method, which takes the given object and
transforms it into a response.

#### Example

    app.use(function *(next) {
      this.respond(new Error('Hi!'));
    }

given default settings, will respond with:

    HTTP/1.1 500 Internal Server Error
    {"status":500,"error":"Error","message":"Hi!"}
      
## Configuration

### pretty

If `true`, all plain object responses get converted to 2 space indented JSON.

### catchErrors

If `true`, all downstream errors are caught and returned as if they were
returned via `this.respond`.

#### Example

    app.use(require('koa-json-suit')({catchErrors: true});
    
    app.use(function *() {
      throw new Error("not implemented");
    });

gives the following when called:

    HTTP/1.1 500 Internal Server Error
    {"status":500,"error":"Error","message":"not implemented"}
    
### errorCode(err)

A function that takes the error response, and returns the correct HTTP status
code.

#### Example

    app.use(require('koa-json-suit')({
      errorCode: function (error) {
        return 404;
      }
    }));
    
    app.use(function *() {
      this.respond(new Error("Testing errorCode"));
    });
    
gives the following when called:

    HTTP/1.1 404 Not Found
    {"status":404,"error":"Error","message":"Testing errorCode"}

### errorTransform(err, status)

A function that takes the error response and status code, and returns the
relevant response body.

*By default, when NODE_ENV is 'development', the stack of an error will be
returned as `data.stack`*

#### Example

    app.use(require('koa-json-suit')({
      errorTransform: function (error, status) {
        return {
          status: status,
          isChanged: true
        };
      }
    }));
    
    app.use(function *() {
      this.respond(new Error("Testing errorTransform"));
    });
    
gives the following when called:

    HTTP/1.1 500 Internal Server Error
    {"status":500,"isChanged":true}
