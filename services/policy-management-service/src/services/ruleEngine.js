const jsonLogic = require('json-logic-js');

function evaluateRule(conditions, context) {
  try {
    return jsonLogic.apply(conditions, context);
  } catch (err) {
    throw new Error('Rule evaluation failed: ' + err.message);
  }
}

module.exports = { evaluateRule };
