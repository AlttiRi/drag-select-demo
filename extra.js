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
