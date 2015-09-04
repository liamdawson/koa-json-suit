/*global module */
(function () {
  "use strict";

  module.exports = function (config) {

    // Set up defaults
    config = config ? config : {};

    // Function to determine the status code for an error (if not provided)
    config.errorCode = config.errorCode ||
      function () {
        return 500;
      };

    // Function used to transform an error into a response
    config.errorTransform = config.errorTransform ||
      function (err, status) {
        var data = err.data;

        if(process.env.NODE_ENV === 'development') {
          data = data || {};
          data.stack = err.stack;
        }

        return {
          status: status,
          error: err.name,
          message: err.message,
          data: data
        };
      };

    // Whether to catch all errors from downstream
    config.catchErrors = !!config.catchErrors;

    return function *(next) {
      this.respond = function (obj, status) {
        var body;

        if (obj instanceof Error) {
          this.response.status = status ? status : config.errorCode(obj);
          this.body = JSON.stringify(config.errorTransform(obj, this.response.status), null, (config.pretty) ? 2 : null);
        } else {
          this.response.status = status ? status : 200;
          this.body = JSON.stringify(obj, null, (config.pretty) ? 2 : null);
        }
      };

      if (config.catchErrors) {
        try {
          yield next;
        } catch (ex) {
          this.respond(ex);
        }
      } else {
        yield next;
      }
    };
  };
}());

