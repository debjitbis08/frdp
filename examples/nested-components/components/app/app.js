import { scan, startWith, map, switchMap, withLatestFrom } from 'https://esm.sh/rxjs/operators';
import { defineComponent } from '../../../../src/packages/core/index.js';
import '../task-input/task-input.js';

function App(bindings) {
  const taskList$ = bindings.newTaskAdd$.pipe(
    startWith([]),
    scan((list, newTask) => list.concat(newTask), [])
  );

  // const taskList$ = accumulate((list, newTask) => list.concat(newTask), [], newTaskAdd$);

  taskList$.pipe(
    map((list) => list.length)
  ).subscribe(bindings.numberOfTasks$);

  // pushTo(bindings.numberOfTasks, map((list) => list.length, taskList$));

  taskList$.subscribe(bindings.taskList$);

}

defineComponent('main-app', import.meta.url, App);
