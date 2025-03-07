const { ApplicationException } = require("./exception");

// HTTP status codes
const RESPONSE_BAD_REQUEST_CODE = 400;
const RESPONSE_UNAUTHORIZED = 401;
const RESPONSE_FORBIDDEN_CODE = 403;
const RESPONSE_RESOURCE_NOT_FOUND_CODE = 404;
const RESPONSE_OK_CODE = 200;
const RESPONSE_INTERNAL_SERVER_ERROR = 500;
const RESPONSE_NOT_IMPLEMENTED = 501;
const RESPONSE_SERVICE_UNAVAILABLE_CODE = 503;

/**
 * Builds a response object or raises an ApplicationException for non-200 status codes.
 * @param {Object|string} content - The response content.
 * @param {number} code - The HTTP status code.
 * @returns {Object} - The response object for 200 status code.
 * @throws {ApplicationException} - For non-200 status codes.
 */
function buildResponse(content, code = RESPONSE_OK_CODE) {
  if (code === RESPONSE_OK_CODE) {
    return {
      code,
      body: content,
    };
  }
  throw new ApplicationException(code, content);
}

/**
 * Raises an ApplicationException with the specified code and content.
 * @param {number} code - The HTTP status code.
 * @param {Object|string} content - The error content.
 * @throws {ApplicationException} - Always throws an ApplicationException.
 */
function raiseErrorResponse(code, content) {
  throw new ApplicationException(code, content);
}

module.exports = {
  RESPONSE_BAD_REQUEST_CODE,
  RESPONSE_UNAUTHORIZED,
  RESPONSE_FORBIDDEN_CODE,
  RESPONSE_RESOURCE_NOT_FOUND_CODE,
  RESPONSE_OK_CODE,
  RESPONSE_INTERNAL_SERVER_ERROR,
  RESPONSE_NOT_IMPLEMENTED,
  RESPONSE_SERVICE_UNAVAILABLE_CODE,
  buildResponse,
  raiseErrorResponse,
};
