import { interval, fromEvent, ReplaySubject, Subject } from 'https://esm.sh/rxjs';
import { scan, startWith, map, switchMap, withLatestFrom } from 'https://esm.sh/rxjs/operators';
import { defineComponent } from '../../../../src/packages/core/index.js';

function App(bindings) {
  const counter$ = counter();

  const isRunning$ = isRunning(bindings.startStopClick$);

  const label$ = buttonLabel(isRunning$);

  label$.subscribe(bindings.startStopLabel$);

  const timer$ = timerText(isRunning$, counter$);

  timer$.subscribe(bindings.display$);
}

// Initialize the component
const scriptUrl = import.meta.url;
const htmlUrl = scriptUrl.replace('.js', '.html');

defineComponent('main-app', htmlUrl, App);

// -------

function counter() {
  return interval(1000).pipe(
    startWith(0),
    scan((acc) => acc + 1)
  );
}

function isRunning(click$) {
  return click$.pipe(
    scan(isRunning => !isRunning, false),
  );
}

function buttonLabel(isRunning$) {
  return isRunning$.pipe(
    map(isRunning => (isRunning ? 'Stop' : 'Start'))
  );
}

function timerText(isRunning$, counter$) {
  return isRunning$.pipe(
    switchMap(isRunning => (
      isRunning
      ? counter$
      : []
    )),
    map(val => `Seconds elapsed: ${val}`)
  );
}
