// Lab 2. Create countdown timer using fromEvent
import { fromEvent, interval } from "rxjs";
import { scan, mapTo, filter, takeWhile, takeUntil } from "rxjs/operators";

// elements refs
const countdown = document.getElementById("countdown");
const message = document.getElementById("message");
const abortButton = document.getElementById("abort");

// streams
const counter$ = interval(1000);
const abortClick$ = fromEvent(abortButton, "click");

counter$
  .pipe(
    mapTo(-1),
    scan((accumulator, current) => {
      return accumulator + current;
    }, 5),
    takeWhile((value) => value >= 0),
    takeUntil(abortClick$)
  )
  .subscribe((value) => {
    countdown.innerHTML = value;
    if (!value) {
      message.innerHTML = "Liftoff!";
    }
  });
