import { from, fromEvent, Observable, of, range, interval, empty } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  map,
  pluck,
  mapTo,
  filter,
  reduce,
  scan,
  take,
  tap,
  first,
  takeWhile,
  takeUntil,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  debounceTime,
  debounce,
  throttleTime,
  sampleTime,
  sample,
  auditTime,
  mergeAll,
  mergeMap,
  switchMap,
  concatMap,
  delay,
  exhaustMap,
  catchError,
} from "rxjs/operators";

/*
 * Any code samples you want to play with can go in this file.
 * Updates will trigger a live reload on http://localhost:1234/
 * after running npm start.
 */

const observer = {
  next: (value) => console.log("next", value),
  error: (error) => console.log("error", error),
  complete: () => console.log("complete"),
};

const observable = new Observable((subscribe) => {
  let count = 0;

  const id = setInterval(() => {
    subscribe.next(count);
    subscribe.complete();
    count += 1;
  }, 1000);

  return () => {
    clearInterval(id);
  };
});

// data is being set asynchronously due to Interval functions
// console.log("before");
// observable.subscribe(observer);
// console.log("after");

/**
 *  Creation Operators (chapter 2)
 *
 *  - Stand alone functions to create observables
 */

// Of - create observables from static values using of
// items here are emitted synchronously, there is also no flatten done on any of the arg passed through
const source$ = of(1, 2, 3, 4, 5);
const sourceRange$ = range(1, 5);
// source$.subscribe(observer);
// sourceRange$.subscribe(observer);

// Turn arrays, iterators and promises into observables.
const sourceFrom$ = from(["1,2,3,4,5"]);
sourceFrom$.subscribe(observer);

/* 
    
        Operators (Chapter 3)

*/

// Transform streams using map and pluck
console.log("Transform streams using map and pluck");

of(1, 2, 3, 4, 5)
  .pipe(map((value) => value * 10))
  .subscribe();

const keyup$ = fromEvent(document, "keyup");

const keycode$ = keyup$.pipe(map((event) => event.code));
// another way is to use pluck
const keycodePluck$ = keyup$.pipe(pluck("code"));

const pressed$ = keyup$.pipe(mapTo("Key Pressed!"));

// keycodePluck$.subscribe(console.log);
// pressed$.subscribe(console.log);

// Ignore unneeded value with filter

of(1, 2, 3, 4, 5)
  .pipe(filter((value) => value > 2))
  .subscribe(console.log);

// Lab 1. Create a scroll progress bar with fromEvent
// - see scrollbar.js

// Accumulate data over time using reduce

const numbers = [1, 2, 3, 4, 5];
const totalReducer = (accumulator, currentValue) => {
  return accumulator + currentValue;
};

interval(1000).pipe(take(3), reduce(totalReducer, 0));
// .subscribe({
//   next: console.log,
//   complete: () => console.log("complete"),
// });

// Manage state changes incrementally with scan
console.log("Scan example: ");

const user = [
  { name: "Brian", loggedIn: false, token: null },
  { name: "Brian", loggedIn: true, token: "abc" },
  { name: "Brian", loggedIn: true, token: "123" },
];

// example 1
const userState$ = from(user).pipe(
  scan((accumulator, currentValue) => {
    return { ...accumulator, ...currentValue };
  }, {})
);

const name$ = userState$.pipe(map((state) => state.name));
name$.subscribe(console.log);

// example 2
from(numbers)
  .pipe(
    scan((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0)
  )
  .subscribe(console.log);

// Lab 2. Create countdown timer using fromEvent
// See countdown.js

// Tap - debugging your observables streams with tap
/*  
    The tap operator let you spy on a source observable performing side
    effect while not impacting the current stream. It almost like you step
    out of the stream. Good for debugging for inspecting observable behaviour.
*/

const numbers$ = of(1, 2, 3, 4, 5);

numbers$
  .pipe(
    tap((value) => console.log("before", value)),
    map((value) => value * 10)
  )
  .subscribe();

// return value of tap is ignored

/**
 *
 *        Filtering Operators (Chapter 4)
 *
 */

// take() or first() operator - Emit a set number of values

const click$ = fromEvent(document, "click");

// take Operator  ------------------------------------------------
// click$
//   .pipe(
//     map((event) => ({ x: event.clientX, y: event.clientY })),
//     take(1)
//   )
//   .subscribe({
//     next: console.log,
//     complete: () => console.log("Take Complete!"),
//   });

// first Operator ------------------------------------------------
// click$
//   .pipe(
//     map((event) => ({ x: event.clientX, y: event.clientY })),
//     first(({ y }) => y > 200) // only show once if condition is true
//   )
//   .subscribe({
//     next: console.log,
//     complete: () => console.log("First Complete!"),
//   });

// takeWhile Operator  ------------------------------------------------
click$
  .pipe(
    map((event) => ({ x: event.clientX, y: event.clientY })),
    takeWhile(({ y }) => y <= 200, true)
  )
  .subscribe({
    next: console.log,
    complete: () => console.log("TakeWhile Complete!"),
  });

// takeUntil - accepts another observable as a argument
// const counter$ = interval(1000);
// counter$.pipe(takeUntil(click$)).subscribe(console.log);

// distinctUntilChanged Operator  --------------------------------------------------
const num$ = of(1, 2, 3, 3, 3, 4, 5);

// no args needed, distinctUntilChanged emits new values
num$.pipe(distinctUntilChanged()).subscribe(console.log);

// distinctUntilKeyChanged Operator  --------------------------------------------------
// compare on a object property - name is property of User object
const user$ = userState$.pipe(
  distinctUntilKeyChanged("name"),
  map((state) => state.name)
);
user$.subscribe(console.log);

/**
 *
 *      Rate Limiting Operators (Chapter 5)
 *
 */

// debounceTime Operator --------------------------------------------------
// is useful in scenarios where there is a load of emitted values but you
// are really only concerned about the last value after a pause and action.
// Prime example: Saving user input from a text box.

const inputBox = document.getElementById("text-input");
const input$ = fromEvent(inputBox, "keyup");

// input$
//   .pipe(debounceTime(1000), pluck("target", "value"), distinctUntilChanged())
//   .subscribe(console.log);

// debounce Operator --------------------------------------------------
// if you need to update the interval time based on a function or source use debounce
// input$
//   .pipe(
//     debounce(() => interval(1000)),
//     pluck("target", "value"),
//     distinctUntilChanged()
//   )
//   .subscribe(console.log);

// throttleTime Operator --------------------------------------------------
// ignore values during windows using throttleTime

// click$.pipe(throttleTime(3000)).subscribe(console.log);

// sampleTime Operator --------------------------------------------------
// sample a stream on a uniform duration

// click$
//   .pipe(
//     sampleTime(4000),
//     map(({ clientX, clientY }) => ({ clientX, clientY }))
//   )
//   .subscribe(console.log);

// sample Operator --------------------------------------------------
// sample off another observable
const timer$ = interval(10000);
// timer$.pipe(sample(click$)).subscribe(console.log);

// auditTime Operator --------------------------------------------------
// click$.pipe(auditTime(4000)).subscribe(console.log);

/**
 *
 *      Transformation Operators (Chapter 6)
 *
 */

// Transform values as they flow through stream.

// What is a flattening operators? - take observables and emits observables
// transform operators, get a value and return something else

// mergeAll Operator --------------------------------------------------
// input$
//   .pipe(
//     map((event) => {
//       const term = event.target.value;
//       return ajax.getJSON(`https://api.github.com/users/${term}`);
//     }),
//     debounceTime(1000),
//     mergeAll()
//   )
//   .subscribe(console.log);

// mergeMap Operator --------------------------------------------------

/**
 *  > Maps values to a new observable on emissions from source, subscribing to
 *    and emitting results of inner observables
 *
 *  > By default mergeMap does not limit the number of active inner observables.
 *
 *  > Useful for HTTP request you do not want cancelled, such as POSTs or
 *    inner observables whose lifetime you will manager
 */

input$
  .pipe(
    debounceTime(1000),
    mergeMap((event) => {
      const term = event.target.value;
      return ajax.getJSON(`https://api.github.com/users/${term}`);
    })
  )
  .subscribe();

const interval$ = interval(1000);
const mousedown$ = fromEvent(document, "mousedown");
const mouseup$ = fromEvent(document, "mouseup");

mousedown$
  .pipe(mergeMap(() => interval$.pipe(takeUntil(mouseup$))))
  .subscribe();

const coordinates$ = click$.pipe(
  map((event) => ({
    x: event.clientX,
    y: event.clientY,
  }))
);

const coordinatesWithSave$ = coordinates$.pipe(
  mergeMap((coords) =>
    ajax.post("http://www.mocky.io/v2/5185415ba171ea3a00704eed", coords)
  )
);

coordinatesWithSave$.subscribe();

// switchMap Operator --------------------------------------------------

/**
 *  > safest default for flattening, hard to create leaks like mergeMap
 *  > Useful for HTTP request that can be cancelled [GET]
 *  > Great for reset, pause and resume functionality
 */

const typeaheadContainer = document.getElementById("typeAhead-container");
const switchMapInput = document.getElementById("input");
const BASE_URL = "https://api.openbrewerydb.org/breweries";

const switchMapInput$ = fromEvent(switchMapInput, "keyup");

// switchMapInput$
//   .pipe(
//     debounceTime(200),
//     pluck("target", "value"),
//     distinctUntilChanged(),
//     switchMap((searchTerm) => {
//       return ajax.getJSON(`${BASE_URL}?by_name=${searchTerm}`);
//     })
//   )
//   .subscribe((response) => {
//     typeaheadContainer.innerHTML = response.map((b) => b.name).join("<br>");
//   });

// concatMap Operator --------------------------------------------------

// click$.pipe(concatMap(() => interval$.pipe(take(3))));

const radioButtons = document.querySelectorAll(".radio-option");

const answerChange$ = fromEvent(radioButtons, "click");

const saveAnswer = (answer) => {
  // simulate delayed request
  return of(`Saved: ${answer}`).pipe(delay(1500));
};

answerChange$
  .pipe(concatMap((event) => saveAnswer(event.target.value)))
  .subscribe();

// be careful if you have long running inner observables, as subsequent mapped
// observables could back up or never execute

// exhaustMap Operator --------------------------------------------------
/* > good for login btns, if users keep clicking on the 'login' btn.
   > ignores emitted values when there is an active inner observable.
   > Use when quick, subsequent emissions can be ignored, like refresh 
     button or login request
   > Avoid if cancellation is important, or ignoring emissions from source 
     would cause  undesired effects  
*/

const authUser = () => {
  return ajax.post("https://reqres.in/api/log", {
    email: "eve.holt@reqres.in",
    password: "cityslicka",
  });
};

const loginButton = document.getElementById("login");
const login$ = fromEvent(loginButton, "click");

login$.pipe(exhaustMap(() => authUser())).subscribe(console.log);

// catchError Operator --------------------------------------------------

switchMapInput$
  .pipe(
    debounceTime(200),
    pluck("target", "value"),
    distinctUntilChanged(),
    switchMap((searchTerm) => {
      return ajax.getJSON(`${BASE_URL}?by_name=${searchTerm}`).pipe(
        catchError((error) => {
          // return of error
          return empty();
        })
      );
    })
  )
  .subscribe((response) => {
    typeaheadContainer.innerHTML = response.map((b) => b.name).join("<br>");
  });
