import { ERR_NOT_COMPATIBLE, ERR_MISSING_MEASURE_NAME, ERR_ENTRY_LOCKED, ERR_MEASURE_NAME_NOT_EXIST, ERR_INSUFFICIENT_MARKS, ERR_INVALID_RANGE, ERR_INVALID_CLEAR_TOKEN } from "./messages.mjs";

const Timenstein = (function (window) {
  // Private variables
  let marks = {}, measures = {};
  let errorLogging, errorLogLevel, namespace, namespaceSeparator, performanceObserver;
  const compatible = "performance" in window && "mark" in window.performance && "measure" in window.performance && "getEntriesByName" in window.performance && "getEntriesByType" in window.performance && "clearMarks" in window.performance && "PerformanceObserver" in window;

  // Private methods
  const clone = obj => JSON.parse(JSON.stringify(obj));

  const inRange = (n, min, max) => n > min && n < max;

  const getMeasureNameFromMarkName = entryName => {
    const markName = entryName.split(namespaceSeparator)[1];

    return markName.split("-").map((item, index, array) => {
      if (index < array.length - 1) {
        return item;
      }
    }).join("");
  };

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

    performanceObserver = new PerformanceObserver(entryList => {
      entryList.getEntries().forEach(entry => {
        if (entry.entryType === "mark") {
          const measureName = getMeasureNameFromMarkName(entry.name);
          marks[measureName].entries.push(clone(entry));
        }

        if (entry.entryType === "measure") {
          console.dir(entry);
        }
      });
    });

    performanceObserver.observe({
      entryTypes: ["mark", "measure"]
    });

    return true;
  }

  // Public methods
  Timenstein.prototype.mark = function (measureName, end) {
    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);

      return false;
    }

    if (!measureName) {
      log(ERR_MISSING_MEASURE_NAME);

      return false;
    }

    end = end || false;
    let markNumber, markName;

    if (measureName in marks && marks[measureName].locked) {
      log(ERR_ENTRY_LOCKED);

      return false;
    }

    if (measureName in marks) {
      markNumber = marks[measureName].entries.length + 1;
    } else {
      markNumber = 1;
      marks[measureName] = {
        locked: false,
        entries: []
      };
    }

    markName = `${namespace}${namespaceSeparator}${measureName}-${markNumber}`;
    performance.mark(markName);

    if (end) {
      marks[measureName].locked = true;
    }

    return {
      markName,
      markNumber
    };
  };

  Timenstein.prototype.measure = function (measureName, from, to) {
    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);

      return false;
    }

    if (!measureName) {
      log(ERR_MISSING_MEASURE_NAME);

      return false;
    }

    if (measureName in marks === false) {
      log(ERR_MEASURE_NAME_NOT_EXIST);

      return false;
    }

    const max = marks[measureName].entries.length;

    if (max < 2) {
      log(ERR_INSUFFICIENT_MARKS);

      return false;
    }

    from = from || 1;
    to = to || max;
    const validRange = from < to || to > from || inRange(from, 1, max) || inRange(to, 1, max);

    if (!validRange) {
      log(ERR_INVALID_RANGE);

      return false;
    }

    const namespacedMeasureName = `${namespace}${namespaceSeparator}${measureName}`;
    const startMark = performance.getEntriesByName(`${measureName}-${from}`)[0];
    const endMark = performance.getEntriesByName(`${measureName}-${to}`)[0];

    if (namespacedMeasureName in measures === false) {
      measures[namespacedMeasureName] = [];
    }

    performance.measure(namespacedMeasureName, startMark, endMark);

    return true;
  };

  Timenstein.prototype.clear = function (what) {
    if (what !== "marks" && what !== "measures") {
      log(ERR_INVALID_CLEAR_TOKEN);

      return false;
    }

    if (what === "marks" || what === "measures") {
      const method = `clear${what[0].toUpperCase() + what.slice(1)}`;
      const entryType = what.substr(0, what.length - 1);

      performance.getEntries().forEach(entry => {
        if (entry.entryType === entryType && entry.name.indexOf(`${namespace}${namespaceSeparator}`) === 0) {
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
}(window));

export default Timenstein;
