const { ApplicationException, buildResponse } = require("commons");
const { getLogger } = require("commons/log_helper");

const _LOG = getLogger(__name__);

class AbstractLambda {
  /**
   * Validates event attributes.
   * @param {Object} event - Lambda incoming event.
   * @returns {Object} - Object with attribute_name as key and error_message as value.
   */
  validateRequest(event) {
    throw new Error("validateRequest method must be implemented by subclass");
  }

  /**
   * Handles the Lambda request.
   * @param {Object} event - Lambda event.
   * @param {Object} context - Lambda context.
   * @returns {Object} - Execution result.
   */
  handleRequest(event, context) {
    throw new Error("handleRequest method must be implemented by subclass");
  }

  /**
   * Lambda handler method to manage the execution flow.
   * @param {Object} event - Lambda event.
   * @param {Object} context - Lambda context.
   * @returns {Object} - Response object.
   */
  async lambdaHandler(event, context) {
    try {
      _LOG.debug(`Request: ${JSON.stringify(event)}`);
      if (event.warm_up) {
        return; // Skip processing for warm-up events
      }

      const errors = this.validateRequest(event);
      if (errors && Object.keys(errors).length > 0) {
        return buildResponse(400, errors);
      }

      const executionResult = await this.handleRequest(event, context);
      _LOG.debug(`Response: ${JSON.stringify(executionResult)}`);
      return executionResult;
    } catch (e) {
      if (e instanceof ApplicationException) {
        _LOG.error(
          `Error occurred; Event: ${JSON.stringify(event)}; Error: ${e.message}`
        );
        return buildResponse(e.code, e.content);
      } else {
        _LOG.error(
          `Unexpected error occurred; Event: ${JSON.stringify(event)}; Error: ${
            e.message
          }`
        );
        return buildResponse(500, "Internal server error");
      }
    }
  }
}

module.exports = AbstractLambda;
