import {
  ERR_NOT_COMPATIBLE,
  ERR_MISSING_MEASURE_NAME,
  ERR_ENTRY_LOCKED,
  ERR_MEASURE_NAME_NOT_EXIST,
  ERR_INSUFFICIENT_MARKS,
  ERR_INVALID_RANGE,
  ERR_INVALID_CLEAR_TOKEN
} from "./messages.mjs";

const Timenstein = (function (window, performance) {
  // Private variables
  let marks = {}, measures = {};
  let errorLogging, errorLogLevel, namespace, namespaceSeparator;
  const compatible = performance && "mark" in performance && "measure" in performance && "getEntriesByName" in performance && "clearMarks" in performance && "clearMeasures" in performance;

  // Private methods
  const clone = obj => JSON.parse(JSON.stringify(obj));

  const inRange = (n, min, max) => n >= min && n <= max;

  const log = msg => {
    if (errorLogging) {
      console[errorLogLevel](msg);
    }
  };

  // Constructor
  function Timenstein (options) {
    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);

      return false;
    }

    options = options || {};
    errorLogging = options.errorLogging || true;
    errorLogLevel = /^(log|warn|error)$/.test(options.errorLogLevel) ? options.errorLogLevel : "warn";
    namespace = options.namespace || "timenstein";
    namespaceSeparator = options.namespaceSeparator || "::";

    return true;
  }

  // Public methods
  Timenstein.prototype.mark = function (measureName, end) {
    end = end || false;
    let markNumber, markName;

    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);

      return false;
    }

    if (!measureName) {
      log(ERR_MISSING_MEASURE_NAME);

      return false;
    }

    const namespacedMeasureName = `${namespace}${namespaceSeparator}${measureName}`;

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

    markName = `${namespacedMeasureName}-${markNumber}`;
    performance.mark(markName);

    if (end) {
      marks[namespacedMeasureName].locked = true;
    }

    const markEntry = clone(performance.getEntriesByName(markName)[0]);

    marks[namespacedMeasureName].entries.push(markEntry);

    return {
      markName,
      markNumber
    };
  };

  Timenstein.prototype.measure = function (measureName, startSegment, endSegment) {
    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);

      return false;
    }

    if (!measureName) {
      log(ERR_MISSING_MEASURE_NAME);

      return false;
    }

    const namespacedMeasureName = `${namespace}${namespaceSeparator}${measureName}`;

    if (namespacedMeasureName in marks === false) {
      log(ERR_MEASURE_NAME_NOT_EXIST);

      return false;
    }

    const max = marks[namespacedMeasureName].entries.length;

    if (max < 2) {
      log(ERR_INSUFFICIENT_MARKS);

      return false;
    }

    startSegment = startSegment || 1;
    endSegment = endSegment || max;
    const validRange = startSegment < endSegment && endSegment > startSegment && inRange(startSegment, 1, max) && inRange(endSegment, 1, max);

    if (!validRange) {
      log(ERR_INVALID_RANGE);

      return false;
    }

    const startMark = performance.getEntriesByName(`${measureName}-${startSegment}`)[0];
    const endMark = performance.getEntriesByName(`${measureName}-${endSegment}`)[0];

    if (namespacedMeasureName in measures === false) {
      measures[namespacedMeasureName] = {
        entries: []
      };
    }

    performance.measure(namespacedMeasureName, startMark, endMark);

    let measureEntry = clone(performance.getEntriesByName(namespacedMeasureName)[0]);
    measureEntry.start = startSegment;
    measureEntry.end = endSegment;

    measures[namespacedMeasureName].entries.push(measureEntry);

    return true;
  };

  Timenstein.prototype.clear = function (what, pattern) {
    if (what !== "marks" && what !== "measures") {
      log(ERR_INVALID_CLEAR_TOKEN);

      return false;
    }

    if (what === "marks" || what === "measures") {
      const method = `clear${what[0].toUpperCase() + what.slice(1)}`;
      const entryType = what.substr(0, what.length - 1);

      performance.getEntries().forEach(entry => {
        let match = entry.entryType === entryType && entry.name.indexOf(`${namespace}${namespaceSeparator}`) === 0;

        if (pattern instanceof RegExp) {
          match = match && pattern.test(entry.name);
        }

        if (match) {
          performance[method](entry.name);
        }
      });

      return true;
    }
  };

  Timenstein.prototype.getMarks = function () {
    return marks;
  };

  Timenstein.prototype.getMeasures = function () {
    return measures;
  };

  return Timenstein;
}(window, performance));

export default Timenstein;
