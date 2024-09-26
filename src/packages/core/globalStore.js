// Global store for component outputs
const componentStore = new Map();

export function registerComponentOutputs(id, outputs) {
  console.log("storing outputs for ", id, outputs);
  componentStore.set(id, outputs);
}

export function getComponentOutputs(id) {
  console.log("getting outputs for ", id);
  return componentStore.get(id);
}
