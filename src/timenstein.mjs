function Timenstein (options) {
  // We use this pattern for default options because using ES6 default params
  // current introduces transpiler bloat in all environments.
  options || {};

  this.namespace = "namespace" in options ? options.namespace : "timenstein";
  this.log = "logging" in options ? options.log : false;
  this.logLevel = "logLevel" in options ? options.logLevel : "warn";

  this.compatible = "performance" in window && "mark" in window.performance && "measure" in window.performance && "getEntriesByName" in window.performance && "getEntriesByType" in window.performance && "clearMarks" in window.performance;
  this.marks = {};
  this.measures = {};
}

Timenstein.prototype.mark = function (measureName) {
  // Nothing will happen if the APIs we need aren't available. Also, if
  // a name for the measure we want to make isn't specified, nothing happens.
  if (measureName && this.compatible) {
    let markNumber, markName;

    // Check to see if this measure has been started
    if (measureName in this.marks) {
      markNumber = this.marks[measureName].length + 1;
    } else {
      this.marks[measureName] = [];
      markNumber = 1;
    }

    // Construct the mark name and create a performance mark
    markName = `${this.namespace}:${measureName}-${markNumber}`;
    performance.mark(markName);

    // Create a custom object from the mark we just, er, marked.
    const { name, startTime, duration } = performance.getEntriesByName(markName)[0];
    const markEntry = {
      name,
      startTime,
      duration
    };

    // Record the mark in our marks array.
    this.marks[measureName].push(markEntry);

    return markEntry;
  }

  return false;
};

Timenstein.prototype.measure = function (measureName, from, to) {
  // Once again, we aren't doing anything unless the APIs we need are available.
  // We also need necessary parameters in order to calculate the measure, and
  // ensure that the given measureName has at least two recorded marks.
  if (measureName && this.compatible && measureName in this.marks && this.marks[measureName].length >= 2) {
    const markCount = this.marks[measureName].length;

    // If the `from` and `to` arguments aren't provided, just measure from end
    // to end in the measure's array.
    from = from || 1;
    to = to || this.marks[measureName].length;

    // Make sure the `from` value is in bounds
    if (from < 1 || from >= to || from > markCount) {
      return false;
    }

    // Make sure the `to` value is in bounds
    if (to < 1 || to <= from || to > markCount) {
      return false;
    }

    const measureName = `${this.namespace}:${measureName}`;
    const startMark = performance.getEntriesByName(`${measureName}-${from}`)[0];
    const endMark = performance.getEntriesByName(`${measureName}-${to}`)[0];

    if (measureName in this.measures === false) {
      this.measures[measureName] = [];
    }

    performance.measure(measureName, startMark, endMark);
  }

  return false;
};

Timenstein.prototype.get = function (what) {
  if (what === "marks") {
    return this.marks;
  } else if (what === "measures") {
    return this.measures;
  }

  return false;
};

export default Timenstein;
