# FRDP

**HIGHLY EXPERIMENTAL**

FRDP is a tiny, reactive frontend framework (yes, yet another one!) designed for building small applications.

## Core Principles & Features:

1.  Component system based on web components.
2.  Reactive all the way.
3.  State is optional.
4.  Purely Functional.
5.  No build required.
6.  Clear separation of HTML, CSS & JavaScript code. (Yes, I’m old-school.)
7.  Framework-level preferences.
8.  Signal library agnostic.

## FAQ

### How does FRDP differ from other frontend frameworks like React, Vue, Svelte, or Solid?

FRDP is intended to be **minimalistic** and **closely aligned with core web technologies** like Web Components, HTML, and JavaScript. Unlike other frameworks that introduce abstractions (such as virtual DOMs, component state management, or compilation steps), FRDP:

-   **Avoids unnecessary abstractions** by working directly with native browser APIs.
-   **Does not require explicit state management**. Reactivity is handled using **derived signals**, meaning state changes are automatically managed by signals, reducing the need for manual state management.
-   **No build step is required**, making it simple to use right out of the box for small applications, without complex tooling.

### How do I create a signal in a component?

You cannot create new signals manually. All signals must be derived from user events (clicks, input changes, etc.), server events, or time-based events.

### Is FRDP suitable for large-scale applications?

No. FRDP is designed for smaller applications, focusing on simplicity and minimal overhead. For larger projects, established frameworks such as React, Angular, and Vue offer more comprehensive tooling, performance optimization, and ecosystem support.

### What does "signal library agnostic" mean?

FRDP does not enforce a specific state management system. You can integrate your own reactive signal library, like RxJS, Preact Signals, or any other reactive system of your choice.

### Can I use FRDP with TypeScript?

TypeScript support is coming soon.

### How does FRDP handle component communication?

Component communication is managed by passing signals between parent and child components. This is akin to `props` and `callbacks` in frameworks like React and Solid, but everything in FRDP is a signal.

### What does FRDP mean?

Nothing.

### Why?

> I am the machine and God is it's operator. - Sri Ramakrishna
