const messagePrefix = "[Timenstein]";

export const ERR_NOT_COMPATIBLE = `${messagePrefix} Can't continue because the required performance APIs are not supported in this browser.`;
export const ERR_MISSING_HANDLE = `${messagePrefix} Can't create a performance mark because a handle wasn't given for it.`;
export const ERR_ENTRY_LOCKED = `${messagePrefix} Can't create a performance mark for the given handle because it is locked.`;
export const ERR_HANDLE_NOT_EXIST = `${messagePrefix} The given handle doesn't have any marks associated with it.`;
export const ERR_INSUFFICIENT_MARKS = `${messagePrefix} The given handle must have at least two associated marks in order to make a measurement`;
export const ERR_INVALID_RANGE = `${messagePrefix} The given measurement range is not valid for the handle given.`;
export const ERR_INVALID_TOKEN = `${messagePrefix} This method requires its first argument to be a string of either "marks" or "measures".`;
export const ERR_HANDLE_CONTAINS_NAMESPACE_DELIMITER = `${messagePrefix} The given handle contains the namespace delimiter.`;
export const ERR_HANDLE_CONTAINS_SEGMENT_DELIMITER = `${messagePrefix} The given handle contains the segment delimiter.`;
