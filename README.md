# drag-select-demo

Small and functional JavaScript drag-select [demo](https://alttiri.github.io/drag-select-demo/).

It's not a library, but this demo can be used as a starting point if you need to implement your own drag-select functional on a site.

See [`index.js`](https://github.com/AlttiRi/drag-select-demo/blob/master/index.js) for the code.

![Screenshot](https://user-images.githubusercontent.com/16310547/232238704-9b0659f1-d8f1-42d9-a1e5-63130a194145.png)

Drag-selecting is useful for web file explorers (like Dropbox, Mega, Google Drive),
when you need to select only some files to check their total size / download them.

### Features

It's the relative short js demo, less than 200 lines of the code, but it has the follow features:

- smooth scrolling by the selecting area touching the edge with speed accelerating 
  _(based on the distance between the pointer and the target element's edge)_, independently of the display's frame time,
- the correct resizing/positioning of the selecting area with the `"scroll"` event,
- the selecting area celling within the target element's view port,
- properly displays the borders of the selecting area,
- re-calculation is no more than once per one animation frame (`requestAnimationFrame`),
- continues to work properly after an element resizing/moving,
- ignores clicks on borders/scrolls,
- selectable items are interactive, they are continued to receive all events (text selecting, for example),
- full touches support (use the double tap to start selecting),
- rtl support (`direction: rtl;`).


### About

**The main function is `dragSelect(contElem, opts)`.**

The first argument (`contElem`) is the target element to make elements within it selectable.
It's also the target for the auto-scrolling _(with changing `contElem.scrollLeft` and `contElem.scrollTop` values)_ by the selecting area if `contElem`'s inner content size is bigger than
`contElem`'s view port.

The second argument is optional, it is an object with the follow keys: `onStart`, `onUpdate`, `itemSelector`, `areaClassName`.
- `areaClassName` — a class name for the selecting area, by default, `"drag-select-area"`;
- `itemSelector` — a selector for items which should be selectable, by default, `.drag-selectable"`;
- `onUpdate` — on the selecting area resize/scrolling event callback, by default, it adds `"drag-selected"` class to the selected elements;
- `onStart` — the selecting start callback, by default, it removes `"drag-selected"` class from all selected elements;

The requirement for the target element is to have `position: relative` style for the correct position
of the select area that uses `position: absolute`. So, `dragSelect` automatically adds this style. 
Technically, it's possible to use `position: fixed` with the select area, but in this case it would require to add extra logic to get the same result
as with `position: absolute`.

`dragSelect` adds the main `"pointerdown"` event listener which does not handle clicks on the scroll bar, borders and the selectable items. 
It works only when you start selecting from a click on the space between the selectable items within the target element.
Also, it ignores touches if `touch-action` style is not `none`,
since in this case a browser already have the default handler for this event (scrolling).

It draws the select area rectangle from `x1, y1` point (coordinates taken on `"pointerdown"` event) to `x2, y2` point 
(coordinates taken on `"pointermove"` event).
To get the correct `x2, y2` point on `"scroll"` event it keeps the last `PointerEvent` event 
since `Event"` with `type: "scroll"` have no `clientX` and `clientY` properties.

`resizeArea` function is called not more than once per an animation frame due to `enqueueTask` function, 
which executes only the last added task when `requestAnimationFrame`'s callback fires.

### Util functions

Here is the list of the util function.

#### enableTouchSupport
It allows to do not have all time `touch-action` style set to `none`, so scrolling on mobile browsers will work.
It works the follow way: the first `"pointerdown` event sets `touch-action` to `none` for a short time, and the next `"pointerdown` will start to
draw the selecting area if it was made within that short time.
So, on mobile browsers you just need to use double tap to start selecting.

#### isClickInside

It's just to ignore `"pointerdown"` events on the selectable elements.

#### getRect

Just a wrapper for `getBoundingClientRect`. 
Technically, you can cache the returned result for the better performance,
but do it carefully — you need to reset the cache after scrolling/resizing/moving.

#### isRectanglesIntersected

Returns `true` if there is an intersection between two rectangles _(between the selecting area and a selectable element)_.

#### checkIntersections

Checks the intersection of the select area with _every_ selectable item.
Ideally, it also should have some performance optimization to decrease the count of `isRectanglesIntersected` (`getRect`) calls.

#### createEmptyAreaAt

Just creates the selecting area at the cursor position (`x1, y1`) with the initial size (1x1 px).

#### cellNum(num, min, max)

Limits the passed `num` by `min`, `max` bounds.

#### cellPointIntoElemViewport

Limits the passed point (`x2, y2` from `"pointermove"`) by the target element's viewport.

#### cellPointIntoElem

Limits the passed point by the target element's bounds. Unused in the demo.

#### scrollElem

Scrolls the target element when the select area touches the target element's viewport bounds.
It uses `cellPointIntoElemViewport`.
Scroll speed depends on the distance between the cursor and the element's viewport edge.
To accelerate the speed move away the pointer.
To make the scroll speed independent of the client's monitor frame rate (FPS) 
_(since `resizeArea` is called in `requestAnimationFrame`)_, it uses the frame time based multiplier `frameTime`.

To make scrolling smooth it's better to always scroll with the same speed (add the same _integer_ difference in pixels).
Do not use dynamically detected frame rate.
Instead of such frame rate: `7 7 7 8 7 7 6 6 7 7` just always use the constant frame rate `7`.

#### getAvgFrameTime

Computes the average frame rate based of N (`10`) calls of `requestAnimationFrame` and `Math.round`s it to an integer.

I use it once after 200 ms after the web page loading and put the result to the global variable 
`globalThis.frameTime` to use it in `scrollElem` function to makes scrolling speed the same on displays with the different frame rates.
