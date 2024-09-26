import { scan, startWith, map, switchMap, withLatestFrom } from 'https://esm.sh/rxjs/operators';
import { defineComponent } from '../../../../src/packages/core/index.js';

function TaskInput(bindings) {
  const taskName$ = bindings.taskNameInputChange$.pipe(
    map((event) => event.target.value)
  );

  // const taskName$ = eventTargetValue(bindings.taskNameInputChange$);

  // Combine taskName$ and addTask$ to emit taskName$ whenever addTask$ emits
  const newTaskAdd$ = bindings.addTaskButtonClick$.pipe(
    withLatestFrom(taskName$),
    map(([_, taskName]) => taskName)
  );

  newTaskAdd$.subscribe((l) => console.log(l));

  // const newTaskAdd$ = whenThen(bindings.addTaskButtonClick$, taskName$);

  return {
    newTaskAdd$
  };
}

defineComponent('task-input', import.meta.url, TaskInput);
