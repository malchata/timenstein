const messagePrefix = "[Timenstein]";

export const ERR_NOT_COMPATIBLE = `${messagePrefix} Can't continue because the required performance APIs are not supported in this browser.`;
export const ERR_MISSING_MEASURE_NAME = `${messagePrefix} Can't create a performance mark because a measure name wasn't given for it.`;
export const ERR_ENTRY_LOCKED = `${messagePrefix} Can't create a performance mark for the given measure name because it is locked.`;
export const ERR_MEASURE_NAME_NOT_EXIST = `${messagePrefix} The given measure name doesn't have any marks associated with it.`;
export const ERR_INSUFFICIENT_MARKS = `${messagePrefix} The given measure name must have at least two associated marks in order to make a measurement`;
export const ERR_INVALID_RANGE = `${messagePrefix} The given measurement range is not valid for the measure name given.`;
export const ERR_INVALID_CLEAR_TOKEN = `${messagePrefix} When invoking the \`clear\` method, its sole argument must either be "marks" or "measures".`;
