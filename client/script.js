const { animate, stagger } = Motion;

introAnimation();

async function introAnimation() {
    animate(
        ".navbar .title span",
        { opacity: 1, translate: "0px" },
        { ease: [0.25, 0.25, 0, 1], duration: 1, delay: stagger(0.05) }
    );

    animate(
        ".background .stripes div",
        { height: "100%" },
        { type: "circInOut", duration: 1, delay: stagger(0.1) }
    );

    animate(
        ".foreground .content",
        { opacity: 1, translate: "0% 0%" },
        { ease: [0, 0, 0, 1], duration: 1, delay: 0.5 }
    );
}

function getVideoId(source) {
    const sourceParse = new URL(source);

    let id = sourceParse.searchParams.get("v");

    if (!id) {
        const path = sourceParse.pathname
            .split("/")
            .filter((value) => value !== "");
        id = path[path.length - 1];
    }

    return id;
}

function updatePreview(id) {
    if (id.length === 11) {
        const composedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
        const iframe = document.getElementById("videoPreview");

        if (iframe.src !== composedUrl) {
            iframe.src = composedUrl;
        }
    }
}

function urlInputChange() {
    updatePreview(getVideoId(document.getElementById("providedUrl").value));
}
