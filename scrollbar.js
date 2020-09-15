// Lab 1. Create a scroll progress bar with fromEvent

import { fromEvent } from "rxjs";
import { map, tap, throttleTime } from "rxjs/operators";

// helpers
function calculateScrollPercent(element) {
  const { scrollTop, scrollHeight, clientHeight } = element;
  return (scrollTop / (scrollHeight - clientHeight)) * 100;
}

// elements
const progressBar = document.querySelector(".progress-bar");

// streams
const scroll$ = fromEvent(document, "scroll");
const progress$ = scroll$.pipe(
  throttleTime(200), // stops calculate fun being called constantly and stops it being jumpy
  // percent progress
  map(({ target }) => calculateScrollPercent(target.documentElement))
);

progress$.subscribe((percent) => {
  progressBar.style.width = `${percent}`;
});
