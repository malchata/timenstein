const Timenstein = (function () {
  // Private variables
  const compatible = "performance" in window && "mark" in window.performance && "measure" in window.performance && "getEntriesByName" in window.performance && "getEntriesByType" in window.performance && "clearMarks" in window.performance;
  let marks = {}, measures = {};
  let namespace;

  // Private methods
  const clone = obj => JSON.parse(JSON.stringify(obj));

  // Constructor
  function Timenstein (options) {
    options = options || {};

    namespace = "namespace" in options ? options.namespace : "timenstein";
  }

  // Public methods
  Timenstein.prototype.mark = function (measureName) {
    if (measureName && compatible) {
      let markNumber, markName;

      // Check to see if this measure has been started
      if (measureName in marks) {
        markNumber = marks[measureName].length + 1;
      } else {
        marks[measureName] = [];
        markNumber = 1;
      }

      // Construct the mark name and create a performance mark
      markName = `${namespace}:${measureName}-${markNumber}`;
      performance.mark(markName);

      // Create a custom object from the mark we just, er, marked.
      const markEntry = clone(performance.getEntriesByName(markName)[0]);

      // Record the mark in our marks array.
      marks[measureName].push(markEntry);

      return markEntry;
    }

    return false;
  };

  Timenstein.prototype.measure = function (measureName, from, to) {
    if (measureName && compatible && measureName in marks && marks[measureName].length >= 2) {
      // Set up param defaults
      from = from || 1;
      to = to || marks[measureName].length;

      const markCount = marks[measureName].length;

      // Make sure the `from` and `to` values are in bounds
      if (from < 1 || from > to || from > markCount) {
        return false;
      }

      if (to < 1 || to < from || to > markCount) {
        return false;
      }

      const namespacedMeasureName = `${namespace}:${measureName}`;
      const startMark = performance.getEntriesByName(`${measureName}-${from}`)[0];
      const endMark = performance.getEntriesByName(`${measureName}-${to}`)[0];

      if (namespacedMeasureName in measures === false) {
        measures[namespacedMeasureName] = [];
      }

      performance.measure(namespacedMeasureName, startMark, endMark);
      const measureEntry = clone(performance.getEntriesByName(namespacedMeasureName)[0]);
      measures[namespacedMeasureName].push(measureEntry);

      return measureEntry;
    }

    return false;
  };

  Timenstein.prototype.clear = function (what) {
    if (what === "marks" || what === "measures") {
      const method = `clear${what[0].toUpperCase() + what.slice(1)}`;

      performance.getEntries().forEach(entry => {
        if (entry.entryType === what.substr(0, what.length - 1) && entry.name.indexOf(namespace) > -1) {
          performance[method](entry.name);
        }
      });

      return true;
    }

    return false;
  };

  Timenstein.prototype.getMarks = function () {
    return marks;
  };

  Timenstein.prototype.getMeasures = function () {
    return measures;
  };

  return Timenstein;
}());

export default Timenstein;
