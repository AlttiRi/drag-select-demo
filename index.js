const debug1 = document.querySelector(".debug-1");
const debug2 = document.querySelector(".debug-2");
const debug3 = document.querySelector(".debug-3");
const debug4 = document.querySelector(".debug-4");


export function dragSelect(contElem) {
    contElem.style.position = "relative";
    contElem.addEventListener("pointerdown", (event) => {
        if (event.target !== event.currentTarget || event.offsetX > event.target.clientWidth) {
            return;
        }
        event.preventDefault();
        contElem.setPointerCapture(event.pointerId);

        const contRect = getRect(contElem);
        const x1 = event.clientX + contElem.scrollLeft - contRect.x - contElem.clientLeft;
        const y1 = event.clientY + contElem.scrollTop  - contRect.y - contElem.clientTop;

        const areaElem = createAreaAt(x1, y1);
        contElem.append(areaElem);

        const selectableElems = [...document.querySelectorAll(".drag-selectable")];
        selectableElems.forEach(elem => elem.classList.remove("drag-selected"));

        let lastPointerEvent;
        function resize(event) {
            console.log(event);
            if (event.pointerId) {
                lastPointerEvent = event;
            } else {
                event = lastPointerEvent;
            }

            const contRect = getRect(contElem);
            const x2 = event.clientX + contElem.scrollLeft - contRect.x - contElem.clientLeft;
            const y2 = event.clientY + contElem.scrollTop  - contRect.y - contElem.clientTop;

            areaElem.style.left   = Math.min(x1, x2) + "px";
            areaElem.style.top    = Math.min(y1, y2) + "px";
            areaElem.style.width  = Math.abs(x2 - x1) + "px";
            areaElem.style.height = Math.abs(y2 - y1) + "px";

            checkIntersections(areaElem, contElem, selectableElems);

            {
                debug2.textContent = JSON.stringify(
                    ["contElemRect:", getRect(contElem)], null, " ");
                debug3.textContent = JSON.stringify({
                    "contElem.scrollLeft": contElem.scrollLeft,
                    "contElem.scrollTop":  contElem.scrollTop,
                    "contElem.clientLeft": contElem.clientLeft,
                    "contElem.clientTop":  contElem.clientTop,
                }, null, " ");
                debug4.textContent = JSON.stringify({
                    "clientX": event.clientX,
                    "clientY": event.clientY,
                }, null, " ");
            }
        }
        addEventListener("scroll", resize, {capture: true, passive: true});
        contElem.addEventListener("pointermove", resize);
        contElem.addEventListener("lostpointercapture", () => {
            contElem.removeEventListener("pointermove", resize);
            removeEventListener("scroll", resize, {capture: true});
            areaElem.remove();
        }, {once: true});
    }, {passive: false});
}

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
