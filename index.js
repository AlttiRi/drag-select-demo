
export function dragSelect(target) {
    target.style.position = "relative";
    target.addEventListener("pointerdown", (event) => {
        initDragSelect(event, target);
    });
}

const debug1 = document.querySelector(".debug-1");
const debug2 = document.querySelector(".debug-2");
const debug3 = document.querySelector(".debug-3");
const debug4 = document.querySelector(".debug-4");


function checkIntersections(selectAreaElem, contElem, selectableElems) {
    const areaRect = getRect(selectAreaElem);
    const {x, y, height, width} = areaRect;
    debug1.textContent = JSON.stringify(["selectAreaElem", {x, y, height, width}], null, " ");

    for (const itemElem of selectableElems) {
        const itemRect = getRect(itemElem);
        if (isRectanglesIntersected(
            {x: areaRect.x + contElem.scrollLeft, y: areaRect.y + contElem.scrollTop, width: areaRect.width, height: areaRect.height},
            {x: itemRect.x + contElem.scrollLeft, y: itemRect.y + contElem.scrollTop, width: itemRect.width, height: itemRect.height},
        )) {
            itemElem.classList.add("drag-selected");
        } else {
            itemElem.classList.remove("drag-selected");
        }
    }
}

function initDragSelect(event, contElem) {
    if (event.target !== event.currentTarget) { return; }
    event.preventDefault();

    const selectableElems = [...document.querySelectorAll(".drag-selectable")];
    selectableElems.forEach(elem => elem.classList.remove("drag-selected"));

    const contRect = getRect(contElem);
    const init = {
        x: contRect.x,
        y: contRect.y,

        clientX: event.clientX,
        clientY: event.clientY,
        diffX: event.clientX + contElem.scrollLeft - contRect.x,
        diffY: event.clientY + contElem.scrollTop  - contRect.y,

        scrollX: window.scrollX, // aka window.pageXOffset
        scrollY: window.scrollY,

        scrollTop: contElem.scrollTop,
        scrollLeft: contElem.scrollLeft,
    };

    const areaElem = createAreaAt(init.x, init.y);
    contElem.append(areaElem);

    let state;
    function resize(event) {
        const clientX = event.clientX === undefined ? state.clientX : event.clientX;
        const clientY = event.clientY === undefined ? state.clientY : event.clientY;

        const diffX = clientX - init.clientX + (window.scrollX - init.scrollX) + (contElem.scrollLeft - init.scrollLeft);
        const diffY = clientY - init.clientY + (window.scrollY - init.scrollY) + (contElem.scrollTop  - init.scrollTop);

        // const contRect = getRect(contElem);
        const initDiffX = init.diffX // - contRect.x;
        const initDiffY = init.diffY // - contRect.y;

        areaElem.style.left = (diffX < 0 ? initDiffX + diffX : initDiffX) + "px";
        areaElem.style.top  = (diffY < 0 ? initDiffY + diffY : initDiffY) + "px";
        areaElem.style.width  = Math.abs(diffX /*+ init.x - contRect.x*/) + "px";
        areaElem.style.height = Math.abs(diffY /*+ init.y - contRect.y*/) + "px";

        checkIntersections(areaElem, contElem, selectableElems);

        if (event.clientX !== undefined) {
            state = {
                clientX: event.clientX,
                clientY: event.clientY,
            };
        }

        {
            // console.log(event.pageY === undefined, state);
            console.log(event);
            const {x, y, height, width} = getRect(contElem);
            debug2.textContent = JSON.stringify(
                ["contElem:", {x, y, height, width}], null, " ");
            debug3.textContent = JSON.stringify({
                clientY,
                "init.y": init.y,
                "contRect.y": contRect.y,
                "contElem.scrollTop":   contElem.scrollTop,
                "contElem.scrollWidth": contElem.scrollWidth,
            }, null, " ");
            debug4.textContent = JSON.stringify({
                "init.scrollY": init.scrollY,
                "init.scrollX": init.scrollX,
                "window.scrollY": window.scrollY,
                "body.offsetTop": document.body.offsetTop,
            }, null, " ");
        }
    }
    addEventListener("pointermove", resize);
    addEventListener("scroll", resize, {passive: true, capture: true});
    addEventListener("pointerup", () => {
        removeEventListener("pointermove", resize);
        removeEventListener("scroll", resize, {capture: true});
        areaElem.remove();
    }, {once: true});
}

function createAreaAt(x, y) {
    const areaElem = document.createElement("div");
    areaElem.style.position = "absolute";
    areaElem.style.width  = "0";
    areaElem.style.height = "0";
    areaElem.style.left = x + "px";
    areaElem.style.top  = y + "px";
    areaElem.classList.add("drag-select-area");
    return areaElem;
}

function getRect(elem) {
    const rect = elem.getBoundingClientRect();
    return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
}

function isRectanglesIntersected(r1, r2) {
    return !(r1.x + r1.width  < r2.x ||
        r2.x + r2.width  < r1.x ||
        r1.y + r1.height < r2.y ||
        r2.y + r2.height < r1.y);
}
