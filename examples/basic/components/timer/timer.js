import { interval, fromEvent, ReplaySubject, Subject } from 'https://esm.sh/rxjs';
import { scan, startWith, map, switchMap, withLatestFrom } from 'https://esm.sh/rxjs/operators';
import { defineComponent } from '../../../../src/index.js';

function Timer(bindings) {
  const interval$ = interval(1000).pipe(
    startWith(0),
    scan((acc) => acc + 1)
  );

  const isRunning$ = bindings.startStopClick$.pipe(
    scan(isRunning => !isRunning, false),
  );

  const label$ = isRunning$.pipe(
    map(isRunning => (isRunning ? 'Stop' : 'Start'))
  );

  label$.subscribe(bindings.startStopLabel$);

  const timer$ = isRunning$.pipe(
    switchMap(isRunning => (
      isRunning
      ? interval$
      : []
    )),
    map(val => `Seconds elapsed: ${val}`)
  );

  timer$.subscribe(bindings.display$);
}

// Initialize the component
const scriptUrl = import.meta.url;
const htmlUrl = scriptUrl.replace('.js', '.html');

defineComponent('timer-component', htmlUrl, Timer);
