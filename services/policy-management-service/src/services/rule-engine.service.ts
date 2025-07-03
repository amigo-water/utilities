// @ts-ignore
import jsonLogic from 'json-logic-js';

export function evaluateRule(conditions: any, context: any): any {
  try {
    return jsonLogic.apply(conditions, context);
  } catch (err: any) {
    throw new Error('Rule evaluation failed: ' + err.message);
  }
}
