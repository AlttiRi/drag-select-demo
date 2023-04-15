export function debugInfo(contElem, areaElem, event) {
    const debug1 = document.querySelector(".debug-1");
    const debug2 = document.querySelector(".debug-2");
    const debug3 = document.querySelector(".debug-3");
    const debug4 = document.querySelector(".debug-4");

    debug1.textContent = JSON.stringify(["selectAreaElemRect", getRect(areaElem)], null, " ");
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
        "left": areaElem.style.left,
        "top": areaElem.style.top,
        "width": areaElem.style.width,
        "height": areaElem.style.height,
    }, null, " ");
}

function getRect(elem) {
    const rect = elem.getBoundingClientRect();
    return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
}
