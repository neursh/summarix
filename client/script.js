const { animate, stagger } = Motion;

const providedUrl = document.getElementById("providedUrl");
const videoPreview = document.getElementById("videoPreview");

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
    let sourceParse = null;
    try {
        sourceParse = new URL(source);
    } catch {
        return "";
    }

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
    let openSummarize = false;
    let composeUrl = "";

    if (id.length === 11) {
        composeUrl = `https://www.youtube-nocookie.com/embed/${id}`;
        openSummarize = true;
    }

    if (videoPreview.src !== composeUrl) {
        videoPreview.src = composeUrl;

        animate(
            "#summarize",
            { translate: openSummarize ? ["6rem", "12rem"] : "6rem" },
            { ease: [0.25, 0.25, 0, 1], duration: 0.5 }
        );
    }
}

function urlInputChange() {
    updatePreview(getVideoId(providedUrl.value));
}
