async function avgFrameTime() {
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

avgFrameTime().then(console.log);


// With dynamical speed
function scrollElem(contElem, x2, y2) {
    let x = cellNum(x2, contElem.scrollLeft, contElem.scrollLeft + contElem.clientWidth);
    let y = cellNum(y2, contElem.scrollTop, contElem.scrollTop + contElem.clientHeight);

    const diff = 2;
    if (x === contElem.clientWidth + contElem.scrollLeft) {
        contElem.scrollLeft += diff * cellNum((x2 - contElem.scrollLeft - contElem.clientWidth) / 25, diff, 5);
        x = contElem.clientWidth + contElem.scrollLeft;
    } else if (x === contElem.scrollLeft) {
        contElem.scrollLeft -= diff * cellNum((contElem.scrollLeft - x2) / 25, diff, 5);
        x = contElem.scrollLeft;
    }
    if (y === contElem.clientHeight + contElem.scrollTop) {
        contElem.scrollTop += diff * cellNum((y2 - contElem.scrollTop - contElem.clientHeight) / 25, diff, 5);
        y = contElem.clientHeight + contElem.scrollTop;
    } else if (y === contElem.scrollTop) {
        contElem.scrollTop -= diff * cellNum((contElem.scrollTop - y2) / 25, diff, 5);
        y = contElem.scrollTop;
    }
    return [x, y];
}
