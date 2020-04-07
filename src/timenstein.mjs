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
  let errorLogging, errorLogLevel, namespace, namespaceDelimiter, observer;
  const compatible = performance && "mark" in performance && "measure" in performance && "getEntriesByName" in performance && "clearMarks" in performance && "clearMeasures" in performance && "PerformanceObserver" in window;

  // Private methods
  const inRange = (n, max) => n >= 1 && n <= max;
  const getNamespacedHandleFromEntryName = entryName => entryName.split("-")[0];
  const getSegmentNumberFromMarkName = markName => markName.split("-")[1];

  const getSegmentNumbersFromMeasureName = measureName => {
    const measureNameParts = measureName.split("-");

    return [measureNameParts[1], measureNameParts[2]];
  };

  const getResourceTimingsInRange = (start, end) => performance.getEntriesByType("resource").filter(entry => {
    // TODO
  });

  const cloneEntry = entry => "toJSON" in window.PerformanceEntry.prototype ? entry.toJSON() : JSON.parse(JSON.stringify(entry));

  const getPerfEntry = entryName => {
    const entry = performance.getEntriesByName(entryName)[0];

    if (entry) {
      return entry;
    }

    return false;
  };

  const log = msg => {
    if (errorLogging) {
      console[errorLogLevel](msg);
    }
  };

  function Timenstein (options) {
    if (!compatible) {
      log(ERR_NOT_COMPATIBLE);
    } else {
      options = options || {};
      initialized = true;
      errorLogging = options.errorLogging || true;
      errorLogLevel = /^(log|warn|error)$/.test(options.errorLogLevel) ? options.errorLogLevel : "warn";
      namespace = options.namespace || "timenstein";
      namespaceDelimiter = options.namespaceDelimiter || "::";
      observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          const { name, entryType } = entry;

          if (name.indexOf(`${namespace}${namespaceDelimiter}`) !== 0) {
            return;
          }

          if (entryType === "mark") {
            const markEntry = cloneEntry(entry);
            const namespacedHandle = getNamespacedHandleFromEntryName(name);
            const markSegment = getSegmentNumberFromMarkName(name);

            markEntry.segmentNumber = markSegment;
            marks[namespacedHandle].entries.push(markEntry);
          }

          if (entryType === "measure") {
            const namespacedHandle = getNamespacedHandleFromEntryName(name);
            const segments = getSegmentNumbersFromMeasureName(name);
            const measureEntry = cloneEntry(entry);

            measureEntry.startSegment = segments[0];
            measureEntry.endSegment = segments[1];

            measures[namespacedHandle].entries.push(measureEntry);
          }
        });
      });

      observer.observe({
        entryTypes: ["mark", "measure"]
      });
    }

    return initialized;
  }

  Timenstein.prototype.mark = function (handle, end) {
    if (!initialized) {
      log(ERR_NOT_COMPATIBLE);

      return initialized;
    }

    if (!handle) {
      log(ERR_MISSING_HANDLE);

      return false;
    }

    if (handle.indexOf(namespaceDelimiter) > -1) {
      log(ERR_HANDLE_CONTAINS_NAMESPACE_DELIMITER);

      return false;
    }

    let markNumber;
    const namespacedHandle = `${namespace}${namespaceDelimiter}${handle}`;

    if (namespacedHandle in marks && marks[namespacedHandle].locked) {
      log(ERR_ENTRY_LOCKED);

      return false;
    }

    if (namespacedHandle in marks) {
      markNumber = marks[namespacedHandle].entries.length + 1;
    } else {
      markNumber = 1;
      marks[namespacedHandle] = {
        locked: false,
        entries: []
      };
    }

    let markName = `${namespacedHandle}-${markNumber}`;
    performance.mark(markName);

    if (end || false) {
      marks[namespacedHandle].locked = true;
    }

    return true;
  };

  Timenstein.prototype.measure = function (handle, startSegment, endSegment) {
    if (!initialized) {
      log(ERR_NOT_COMPATIBLE);

      return initialized;
    }

    if (!handle) {
      log(ERR_MISSING_HANDLE);

      return false;
    }

    const namespacedHandle = `${namespace}${namespaceDelimiter}${handle}`;

    if (!(namespacedHandle in marks)) {
      log(ERR_HANDLE_NOT_EXIST);

      return false;
    }

    const max = marks[namespacedHandle].entries.length;

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

    if (!(namespacedHandle in measures)) {
      measures[namespacedHandle] = {
        entries: []
      };
    }

    const measureName = `${namespacedHandle}-${startSegment}-${endSegment}`;
    const startMark = `${namespacedHandle}-${startSegment}`;
    const endMark = `${namespacedHandle}-${endSegment}`;

    performance.measure(measureName, startMark, endMark);

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
      const { name, entryType } = entry;

      let match = entryType === givenEntryType && name.indexOf(`${namespace}${namespaceDelimiter}`) === 0;

      if (pattern instanceof RegExp) {
        match = match && pattern.test(name);
      }

      if (match) {
        performance[`clear${what[0].toUpperCase() + what.slice(1)}`](name);
      }
    });

    return true;
  };

  Timenstein.prototype.getMarks = () => marks;
  Timenstein.prototype.getMeasures = () => measures;

  return Timenstein;
})(window, window.performance);

export default Timenstein;
