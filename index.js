export function dragSelect(contElem) {
    contElem.style.position = "relative";
    enableTouchSupport(contElem);
    contElem.addEventListener("pointerdown", onPointerdown, {passive: false});
    function onPointerdown(event) {
        const contRect = getRect(contElem);
        const x1 = event.clientX + contElem.scrollLeft - contRect.x - contElem.clientLeft;
        const y1 = event.clientY + contElem.scrollTop  - contRect.y - contElem.clientTop;

        const contElemStyles = getComputedStyle(contElem);
        const rtlLeftOffset = contElem.scrollLeft < 0 ? contElem.scrollLeft : 0;
        const rtlWidthOffset = contElemStyles["direction"] === "rtl" ? contElem.scrollWidth - contElem.clientWidth : 0;

        const onScrollOrBorder = x1 <= 0 + rtlLeftOffset || y1 <= 0 ||
            x1 >= contElem.clientWidth + contElem.scrollLeft || y1 >= contElem.clientHeight + contElem.scrollTop;
        const unsupportedTouch = event.pointerType === "touch" && contElemStyles["touch-action"] !== "none";
        if (event.target.closest(".drag-selectable") || unsupportedTouch || onScrollOrBorder) { return; }
        event.preventDefault();
        contElem.setPointerCapture(event.pointerId);

        const areaElem = createEmptyAreaAt(x1, y1);
        contElem.append(areaElem);

        const selectableElems = [...contElem.querySelectorAll(".drag-selectable")];
        selectableElems.forEach(elem => elem.classList.remove("drag-selected"));


        let lastTask = null, reqId = null;
        function enqueue(task) {
            lastTask = task;
            if (reqId) { return; }
            reqId = requestAnimationFrame(() => { reqId = null; lastTask(); });
        }

        let lastPointerEvent;
        function resizeAreaPerFrame(event) {
            if (event.type === "scroll" && !lastPointerEvent) { return; }
            event.type !== "scroll" ? (lastPointerEvent = event) : (event = lastPointerEvent);
            enqueue(() => { resizeArea(event); });
        }

        function resizeArea(event) {
            const contRect = getRect(contElem);
            let x2 = event.clientX + contElem.scrollLeft - contRect.x - contElem.clientLeft;
            let y2 = event.clientY + contElem.scrollTop  - contRect.y - contElem.clientTop;
            x2 = cellNum(x2, 0 - rtlWidthOffset, contElem.scrollWidth - rtlWidthOffset);
            y2 = cellNum(y2, 0, contElem.scrollHeight);
            [x2, y2] = scrollElem(contElem, x2, y2);

            areaElem.style.left   = Math.min(x1, x2) + "px";
            areaElem.style.top    = Math.min(y1, y2) + "px";
            areaElem.style.width  = Math.abs(x2 - x1) + "px";
            areaElem.style.height = Math.abs(y2 - y1) + "px";
            checkIntersections(areaElem, contElem, selectableElems);

            debug(contElem, areaElem, event);
        }
        addEventListener("scroll", resizeAreaPerFrame, {capture: true, passive: true});
        contElem.addEventListener("pointermove", resizeAreaPerFrame);
        contElem.addEventListener("lostpointercapture", () => {
            contElem.removeEventListener("pointermove", resizeAreaPerFrame);
            removeEventListener("scroll", resizeAreaPerFrame, {capture: true});
            enqueue(() => { areaElem.remove(); });
        }, {once: true});
    }
}

function cellNum(num, min, max) {
    return Math.max(min, Math.min(num, max));
}

function checkIntersections(selectAreaElem, contElem, selectableElems) {
    const areaRect = getRect(selectAreaElem);
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

function createEmptyAreaAt(x, y) {
    const areaElem = document.createElement("div");
    areaElem.style.position = "absolute";
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
    return !(r1.x + r1.width < r2.x || r1.y + r1.height < r2.y ||
             r2.x + r2.width < r1.x || r2.y + r2.height < r1.y);
}

function enableTouchSupport(contElem) {
    if (getComputedStyle(contElem)["touch-action"] === "none") { return; }
    let timerId;
    contElem.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        clearTimeout(timerId);
        setTimeout(() => contElem.style.touchAction = "none", 0);
        timerId = setTimeout(() => contElem.style.touchAction = "", 400);
    });
}


let avgFrameTime;
setTimeout(async () => {
    avgFrameTime = await getAvgFrameTime();
    console.log("avgFrameTime", avgFrameTime);
}, 200);

function scrollElem(contElem, x2, y2) {
    x2 = cellNum(x2, contElem.scrollLeft, contElem.scrollLeft + contElem.clientWidth);
    y2 = cellNum(y2, contElem.scrollTop, contElem.scrollTop + contElem.clientHeight);

    const diff = Math.ceil(600 * avgFrameTime / 1000);
    if (x2 === contElem.clientWidth + contElem.scrollLeft) {
        contElem.scrollLeft += diff;
        x2 = contElem.clientWidth + contElem.scrollLeft;
    } else if (x2 === contElem.scrollLeft) {
        contElem.scrollLeft -= diff;
        x2 = contElem.scrollLeft;
    }
    if (y2 === contElem.clientHeight + contElem.scrollTop) {
        contElem.scrollTop += diff;
        y2 = contElem.clientHeight + contElem.scrollTop;
    } else if (y2 === contElem.scrollTop) {
        contElem.scrollTop -= diff;
        y2 = contElem.scrollTop;
    }
    return [x2, y2];
}

async function getAvgFrameTime() {
    return new Promise(resolve => {
        let time = Date.now();
        let frameTimes = [];
        let count = 12;
        requestAnimationFrame(
            function loop() {
                const now = Date.now();
                const frameTime = now - time;
                frameTimes.push(frameTime)
                time = now;
                if (--count) {
                    requestAnimationFrame(loop);
                    return;
                }
                resolve(Math.round(frameTimes.slice(2).reduce((pre, acc) => pre + acc, 0) / 10));
            }
        );
    });
}


function debug(contElem, areaElem, event) {
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
