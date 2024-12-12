const { animate, stagger } = Motion;

async function introAnimation() {
    animate(
        ".navbar .title span",
        { opacity: 1, translate: "0px" },
        { ease: [0.25, 0.25, 0, 1], delay: stagger(0.05), duration: 1 }
    );

    await animate(
        ".background .stripes div",
        { height: "100%" },
        { type: "circInOut", delay: stagger(0.1), duration: 1 }
    );

    await animate(
        ".foreground",
        { scale: [1.25, 1], opacity: 1 },
        { ease: [0.25, 0.25, 0, 1], duration: 1 }
    );
}

introAnimation();
