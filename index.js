
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
    const select = getRect(selectAreaElem);
    const {x, y, height, width} = select;
    debug1.textContent = JSON.stringify(["selectAreaElem", {x, y, height, width}], null, " ");

    for (const itemElem of selectableElems) {
        const itemRect = getRect(itemElem);
        if (isRectanglesIntersected(
            {x: x + contElem.scrollLeft, y: y + contElem.scrollTop, height, width},
            {x: itemRect.x + contElem.scrollLeft, y: itemRect.y + contElem.scrollTop, width: itemRect.width, height: itemRect.height})){
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
        x: event.pageX - contRect.x + contElem.scrollLeft,
        y: event.pageY - contRect.y + contElem.scrollTop,
        scrollY: window.scrollY, // aka window.pageYOffset
        scrollX: window.scrollX,
    };

    const areaElem = document.createElement("div");
    areaElem.style.position = "absolute";
    areaElem.style.width  = "0";
    areaElem.style.height = "0";
    areaElem.style.left = init.x + "px";
    areaElem.style.top  = init.y + "px";
    areaElem.classList.add("drag-select-area");
    contElem.append(areaElem);

    let state;
    function resize(event) {
        const pageX = event.pageX === undefined ? state.pageX : event.pageX;
        const pageY = event.pageY === undefined ? state.pageY : event.pageY;

        const diffX = pageX - init.x - contRect.x + contElem.scrollLeft;
        const diffY = pageY - init.y - contRect.y + contElem.scrollTop;
        areaElem.style.left = diffX < 0 ? init.x + diffX - init.scrollX + "px" : init.x - init.scrollX + "px";
        areaElem.style.top  = diffY < 0 ? init.y + diffY - init.scrollY + "px" : init.y - init.scrollY + "px";
        areaElem.style.height = Math.abs(diffY) + "px";
        areaElem.style.width  = Math.abs(diffX) + "px";
        checkIntersections(areaElem, contElem, selectableElems);

        if (event.pageY !== undefined) {
            state = {
                pageX: event.pageX, scrollX: window.scrollX,
                pageY: event.pageY, scrollY: window.scrollY,
            };
        }

        {
            console.log(event.pageY === undefined, state);
            console.log(event);
            const {x, y, height, width} = getRect(contElem);
            debug2.textContent = JSON.stringify(
                ["contElem:", {x, y, height, width}], null, " ");
            debug3.textContent = JSON.stringify({
                pageY,
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
