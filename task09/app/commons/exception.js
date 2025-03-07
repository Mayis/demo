class ApplicationException extends Error {
  /**
   * Custom exception class for application-specific errors.
   * @param {number} code - HTTP status code or custom error code.
   * @param {string|Object} content - Error message or additional error details.
   */
  constructor(code, content) {
    super(`${code}: ${JSON.stringify(content)}`);
    this.code = code;
    this.content = content;
  }

  /**
   * Returns a string representation of the error.
   * @returns {string} - Formatted error string.
   */
  toString() {
    return `${this.code}: ${JSON.stringify(this.content)}`;
  }
}

module.exports = ApplicationException;
