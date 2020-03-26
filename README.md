# Timenstein

<p align="center">
  <img src="franky.jpg" alt="Timenstein's Monster" width="382" height="480" />
</p>

<p align="center">
  <strong>ES5 (.js) version</strong>
</p>
<p align="center">
  <img src="https://img.badgesize.io/malchata/timenstein/master/dist/timenstein.min.js?label=Uncompressed" alt="Uncompressed size.">&nbsp;<img src="https://img.badgesize.io/malchata/timenstein/master/dist/timenstein.min.js?compression=gzip&label=gzip" alt="gzip size.">&nbsp;<img src="https://img.badgesize.io/malchata/timenstein/master/dist/timenstein.min.js?compression=brotli&label=brotli" alt="Brotli size.">
</p>
<p align="center">
  <strong>ES6 (.mjs) version</strong>
</p>
<p align="center">
  <img src="https://img.badgesize.io/malchata/timenstein/master/dist/timenstein.min.mjs?label=Uncompressed" alt="Uncompressed size.">&nbsp;<img src="https://img.badgesize.io/malchata/timenstein/master/dist/timenstein.min.mjs?compression=gzip&label=gzip" alt="gzip size.">&nbsp;<img src="https://img.badgesize.io/malchata/timenstein/master/dist/timenstein.min.mjs?compression=brotli&label=brotli" alt="Brotli size.">
</p>

Timenstein is a very small framework that simplifies working with the [User Timing API](https://www.w3.org/TR/user-timing-3/). The User Timing API is very useful for profiling JavaScript performance in applications, but working with it can be (IMO) unwieldy at times. I made Timenstein to simplify working with it as much as possible.

## How does User Timing work?

The User Timing API consists of two pieces of functionality: marks and measures. Let's recap what these are.

_Marks_ are used to mark specific spots in the [performance timeline](https://developer.mozilla.org/en-US/docs/Web/API/Performance_Timeline) in a page's life cycle. Marks are the simplest aspect of User Timing. They can be used to develop custom metrics specific to your application, such as the time it takes for a user to click on a call to action, for example:

```javascript
document.getElementById("cta-button").addEventListener("click", () => {
  // Define mark name
  const markName = "time-to-cta-click";

  // Mark when the image finishes loading
  performance.mark(markName);

  // Get the entry associated with the mark:
  const markEntry = performance.getEntriesByName(markName)[0];
});
```

_Measures_ are used to measure the time between marks on the performance timeline. This is useful when you want to profile the performance of some part of your application's code, such as an asynchronous operation like a fetch request from an API:

```javascript
document.getElementById("get-data").addEventListener("click", () => {
  // Define mark names
  const startMarkName = "get-data-start";
  const endMarkName = "get-data-end";

  // Mark the start point
  performance.mark(startMarkName);

  // Get the starting performance mark we just made
  const startMark = performance.getEntriesByName(startMarkName)[0];

  fetch("https://bigolemoviedatabase.dev/api/movies/fargo").then(response => response.json()).then(data => {
    // We have the response, now mark the end point
    performance.mark(endMarkName);

    // Get the ending performance mark we just made
    const endMark = performance.getEntriesByName(endMarkName)[0];
  });
});
```

As you can see in both examples, we have to maintain the name of each mark and then retrieve it from the performance entry buffer ourselves either via `getEntriesByName` as shown in the above example, or through a [`PerformanceObserver`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver). The latter is the recommended approach, but can be problematic depending on your application architecture.

## Great, so how does Timenstein simplify this?

Like User Timing, Timenstein makes use of marks and measures, but it stores this information in its own buffer and simplifies measurements by relying on handles. In Timenstein, a handle is a unique string that it uses to organize and manage marks and measures, reducing the amount of work you would otherwise do if you worked with User Timing directly.

```javascript
import Timenstein from "timenstein";

const userPerf = new Timenstein();
```
