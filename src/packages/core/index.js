import { ReplaySubject, Subject, fromEvent } from 'https://esm.sh/rxjs';
import { getPreference } from './preferences.js';

export async function defineComponent(componentName, importMetaUrl, componentFn) {
  const prefix = getPreference('attr-prefix');

  class CustomComponent extends HTMLElement {
    constructor() {
      super();
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

      const textElements = shadow.querySelectorAll(`[${prefix}text]`);
      textElements.forEach(textElement => {
        const observableName = textElement.getAttribute(`${prefix}text`);
        bindings[observableName] = new ReplaySubject(1);

        bindings[observableName].subscribe(value => {
          textElement.textContent = value;
        });
      });

      const allElements = shadow.querySelectorAll('*');

      allElements.forEach(eventElement => {
        const eventAttrs = Array.from(eventElement.attributes).filter(attr => attr.name.startsWith(`${prefix}on:`));

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

      this._processParentOutputs(shadow, bindings).then(() => {
        const outputBindings = componentFn(bindings);

        if (outputBindings) this.outputBindings = outputBindings;

        this.__triggerReady();
      });
    }

    _processParentOutputs(shadow, bindings) {
      const childWithOutElements = Array.prototype.slice.call(shadow.querySelectorAll(`[${prefix}on-out]`));

      return Promise.all(childWithOutElements.map(child => {
        const props = Array.from(child.attributes).filter(attr => attr.name.startsWith(`${prefix}on-out`));

        return new Promise((resolve, reject) => {
          child.onReady(() => {
            const childOutputs = child.outputBindings;

            props.forEach((prop) => {
              const outputName = prop.value.split(':')[0];
              const observableName = prop.value.split(':')[1];

              if (!bindings[observableName]) {
                bindings[observableName] = new ReplaySubject(1); // Store the latest emitted value
              }

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
