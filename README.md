# drag-select-demo

JavaScript drag-select [demo](https://alttiri.github.io/drag-select-demo/).

It's not a library, but this demo can be used as a starting point if you need to implement your own drag-select functional on a site.

See [`index.js`](https://github.com/AlttiRi/drag-select-demo/blob/master/index.js) for the code.

![Screenshot](https://user-images.githubusercontent.com/16310547/232238704-9b0659f1-d8f1-42d9-a1e5-63130a194145.png)


### Features

It's the relative short js demo, less than 200 lines of the code, but it has the follow features:

- scrolling by the selecting area with speed accelerating, independently of the display's frame time,
- correct the selecting area resizing with the `"scroll"` event,
- the selecting area celling in the target element's view port,
- re-calculation is no more than once per one animation frame (`requestAnimationFrame`),
- continues to work properly after element resizing/moving,
- selectable items are interactive, they are continued to receive all events (text selecting, for example),
- full touches support (use the double tap to start selecting),
- rtl support (`direction: rtl;`).


### About

**The main function is `dragSelect(contElem, opts)`.**

The first argument is `contElem`.
It's the target element to make elements within it selectable.
It's also the target for the scrolling by the selecting area if `contElem`'s inner content size is bigger than
`contElem`'s view port _(by changing `contElem.scrollLeft` and `contElem.scrollTop` values)_.

The second argument is optional, is an object with follow keys: `onStart`, `onUpdate`, `itemSelector`, `areaClassName`.
- `areaClassName` — a class name for the selecting area, by default, `"drag-select-area"`;
- `itemSelector` — a selector for items which should be selectable, by default, `.drag-selectable"`;
- `onUpdate` — on the selecting area resize/scrolling event callback, by default, it adds `"drag-selected"` class to the selected elements;
- `onStart` — the selecting start callback, by default, it removes `"drag-selected"` class from all selected elements;

