import { ReplaySubject, Subject } from 'https://esm.sh/rxjs';

export async function defineComponent(componentName, htmlUrl, componentFn) {
  class CustomComponent extends HTMLElement {
    async connectedCallback() {
      const response = await fetch(htmlUrl);
      const componentHTML = await response.text();

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = componentHTML;

      const template = tempContainer.querySelector('template');
      const templateContent = template.content.cloneNode(true);

      const shadow = this.attachShadow({ mode: 'open' });
      shadow.appendChild(templateContent);

      const bindings = {};

      const clickElements = shadow.querySelectorAll('[x-on\\:click]');
      clickElements.forEach(clickElement => {
        const observableName = `${clickElement.getAttribute('x-on:click')}$`;
        bindings[observableName] = new Subject();

        clickElement.addEventListener('click', () => {
          bindings[observableName].next();
        });
      });

      const textElements = shadow.querySelectorAll('[x-text]');
      textElements.forEach(textElement => {
        const observableName = `${textElement.getAttribute('x-text')}$`;
        bindings[observableName] = new ReplaySubject(1);

        bindings[observableName].subscribe(value => {
          textElement.textContent = value;
        });
      });

      componentFn(bindings);
    }
  }

  customElements.define(componentName, CustomComponent);
}
