import {
  ERR_NOT_COMPATIBLE,
  ERR_MISSING_HANDLE,
  ERR_ENTRY_LOCKED,
  ERR_HANDLE_NOT_EXIST,
  ERR_INSUFFICIENT_MARKS,
  ERR_INVALID_RANGE,
  ERR_INVALID_CLEAR_TOKEN,
  ERR_HANDLE_CONTAINS_NAMESPACE_DELIMITER
} from "./messages.mjs";

const Timenstein = (function (window, performance) {
  // Private variables
  let marks = {}, measures = {}, initialized = false;
  let errorLogging, errorLogLevel, namespace, namespaceDelimiter;
  const compatible = performance && "mark" in performance && "measure" in performance && "getEntriesByName" in performance && "clearMarks" in performance && "clearMeasures" in performance;

  // Private methods
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const inRange = (n, max) => n >= 1 && n <= max;
  const getMark = markName => performance.getEntriesByName(markName)[0];

  const log = msg => {
    if (errorLogging) {
      console[errorLogLevel](msg);
    }
  };

  // Constructor
  function Timenstein (options) {
    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);

      return initialized;
    }

    initialized = true;
    options = options || {};
    errorLogging = options.errorLogging || true;
    errorLogLevel = /^(log|warn|error)$/.test(options.errorLogLevel) ? options.errorLogLevel : "warn";
    namespace = options.namespace || "timenstein";
    namespaceDelimiter = options.namespaceDelimiter || "::";

    return initialized;
  }

  // Public methods
  Timenstein.prototype.mark = function (measureName, end) {
    if (!initialized) {
      log(ERR_NOT_COMPATIBLE);

      return initialized;
    }

    if (!measureName) {
      log(ERR_MISSING_HANDLE);

      return false;
    }

    if (measureName.indexOf(namespaceDelimiter) > -1) {
      log(ERR_HANDLE_CONTAINS_NAMESPACE_DELIMITER);

      return false;
    }

    let markNumber;
    const namespacedMeasureName = `${namespace}${namespaceDelimiter}${measureName}`;

    if (namespacedMeasureName in marks && marks[namespacedMeasureName].locked) {
      log(ERR_ENTRY_LOCKED);

      return false;
    }

    if (namespacedMeasureName in marks) {
      markNumber = marks[namespacedMeasureName].entries.length + 1;
    } else {
      markNumber = 1;
      marks[namespacedMeasureName] = {
        locked: false,
        entries: []
      };
    }

    let markName = `${namespacedMeasureName}-${markNumber}`;
    performance.mark(markName);

    if (end || false) {
      marks[namespacedMeasureName].locked = true;
    }

    marks[namespacedMeasureName].entries.push(clone(getMark(markName)));

    return {
      markName,
      markNumber
    };
  };

  Timenstein.prototype.measure = function (measureName, startSegment, endSegment) {
    if (!initialized) {
      log(ERR_NOT_COMPATIBLE);

      return initialized;
    }

    if (!measureName) {
      log(ERR_MISSING_HANDLE);

      return false;
    }

    const namespacedMeasureName = `${namespace}${namespaceDelimiter}${measureName}`;

    if (namespacedMeasureName in marks === false) {
      log(ERR_HANDLE_NOT_EXIST);

      return false;
    }

    const max = marks[namespacedMeasureName].entries.length;

    if (max < 2) {
      log(ERR_INSUFFICIENT_MARKS);

      return false;
    }

    startSegment = startSegment || 1;
    endSegment = endSegment || max;

    if (!(startSegment < endSegment && endSegment > startSegment && inRange(startSegment, max) && inRange(endSegment, max))) {
      log(ERR_INVALID_RANGE);

      return false;
    }

    if (namespacedMeasureName in measures === false) {
      measures[namespacedMeasureName] = {
        entries: []
      };
    }

    performance.measure(namespacedMeasureName, getMark(`${measureName}-${startSegment}`), getMark(`${measureName}-${endSegment}`));

    let measureEntry = clone(getMark(namespacedMeasureName));
    measureEntry.startSegment = startSegment;
    measureEntry.endSegment = endSegment;

    measures[namespacedMeasureName].entries.push(measureEntry);

    return true;
  };

  Timenstein.prototype.clear = function (what, pattern) {
    if (!initialized) {
      log(ERR_NOT_COMPATIBLE);

      return initialized;
    }

    if (!/^m(arks|easures)$/i.test(what)) {
      log(ERR_INVALID_CLEAR_TOKEN);

      return false;
    }

    const givenEntryType = what.substr(0, what.length - 1);

    performance.getEntries().forEach(entry => {
      let match = entry.entryType === givenEntryType && entry.name.indexOf(`${namespace}${namespaceDelimiter}`) === 0;

      if (pattern instanceof RegExp) {
        match = match && pattern.test(entry.name);
      }

      if (match) {
        performance[`clear${what[0].toUpperCase() + what.slice(1)}`](entry.name);
      }
    });

    return true;
  };

  Timenstein.prototype.getMarks = () => marks;

  Timenstein.prototype.getMeasures = () => measures;

  return Timenstein;
}(window, performance));

export default Timenstein;
