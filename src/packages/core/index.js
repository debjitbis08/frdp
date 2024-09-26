import { ReplaySubject, Subject, fromEvent } from 'https://esm.sh/rxjs';
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid@3.3.4/index.browser.js';
import { registerComponentOutputs, getComponentOutputs } from './globalStore.js';

export async function defineComponent(componentName, importMetaUrl, componentFn) {
  class CustomComponent extends HTMLElement {
    constructor() {
      super();
      this.__internal_id__ = nanoid();  // Generate a unique ID for the component
      this.outputBindings = {};
      this.isReady = false;
      this.__onReadyCallbacks = [];
    }

    async connectedCallback() {
      const scriptUrl = importMetaUrl;
      const htmlUrl = scriptUrl.replace('.js', '.html');
      const response = await fetch(htmlUrl);
      const componentHTML = await response.text();

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = componentHTML;

      const template = tempContainer.querySelector('template');
      const templateContent = template.content.cloneNode(true);

      const shadow = this.attachShadow({ mode: 'open' });
      shadow.appendChild(templateContent);

      const bindings = {};

      const textElements = shadow.querySelectorAll('[r-text]');
      textElements.forEach(textElement => {
        const observableName = textElement.getAttribute('r-text');
        bindings[observableName] = new ReplaySubject(1);

        bindings[observableName].subscribe(value => {
          textElement.textContent = value;
        });
      });

      console.log(shadow);
      const allElements = shadow.querySelectorAll('*');

      // Loop through all elements and process r-on attributes
      allElements.forEach(eventElement => {
        // Filter attributes that start with 'r-on:'
        const eventAttrs = Array.from(eventElement.attributes).filter(attr => attr.name.startsWith('r-on:'));

        console.log(eventAttrs);

        // Process each r-on attribute
        eventAttrs.forEach(eventAttr => {
          const eventType = eventAttr.name.split(':')[1];  // Extract the event type (e.g., 'click', 'change', etc.)
          const observableName = eventAttr.value;  // Extract the observable name (e.g., 'clickObservable')

          // Initialize the observable in the bindings object if it doesn't exist
          if (!bindings[observableName]) {
            bindings[observableName] = new Subject();
          }

          // Subscribe to the event and emit values through the observable
          fromEvent(eventElement, eventType).subscribe(event => {
            bindings[observableName].next(event);
          });
        });
      });

      console.log('Processing child bindings', importMetaUrl);
      this._processParentOutputs(shadow, bindings).then(() => {
        console.log(bindings);

        console.log('Running component function', importMetaUrl);
        const outputBindings = componentFn(bindings);

        if (outputBindings) this.outputBindings = outputBindings;

        console.log('Storing output bindings', importMetaUrl);
        // Register component outputs in the global store using __internal_id__
        registerComponentOutputs(this.__internal_id__, outputBindings);

        this.__triggerReady();
      });
    }

    _processParentOutputs(shadow, bindings) {
      const childWithOutElements = Array.prototype.slice.call(shadow.querySelectorAll('[r-on-out]'));

      console.log("childWithOutAttributes", childWithOutElements);
      return Promise.all(childWithOutElements.map(child => {
        const props = Array.from(child.attributes).filter(attr => attr.name.startsWith('r-on-out'));
        console.log("props", props);

        return new Promise((resolve, reject) => {
          child.onReady(() => {
            console.log(`Child onReady: ${child.tagName}`);
            const childOutputs = child.outputBindings;
            console.log("Output Bindings", child.tagName, child.outputBindings);

            props.forEach((prop) => {
              const outputName = prop.value.split(':')[0];
              const observableName = prop.value.split(':')[1];

              if (!bindings[observableName]) {
                bindings[observableName] = new ReplaySubject(1); // Store the latest emitted value
              }

              console.log("child outputs", childOutputs);

              if (childOutputs && childOutputs[outputName]) {
                childOutputs[outputName].subscribe(bindings[observableName]);  // Forward child output to parent
              }
            });

            resolve();
          });
        });
      }));
    }

    onReady(callback) {
      if (this.isReady) callback();

      this.__onReadyCallbacks.push(callback);
    }

    __triggerReady() {
      this.isReady = true;
      this.__onReadyCallbacks.forEach((callback) => {
        callback();
      });
    }
  }

  customElements.define(componentName, CustomComponent);
}
