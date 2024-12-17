const { animate, stagger } = Motion;

const providedUrl = document.getElementById("providedUrl");
const videoPreview = document.getElementById("videoPreview");
const summarizeButton = document.getElementById("summarize");

class SummarixClient {
    socket;
    connected = false;

    takeover() {
        if (!this.connected) {
            providedUrl.setAttribute("disabled", "");
            summarizeButton.setAttribute("disabled", "");
            const url = providedUrl.value;

            this.connected = true;
            this.socket = new WebSocket(
                `ws://localhost:4173/process?url=${url}`
            );
        }
    }

    bind() {
        if (this.socket) {
            this.socket.addEventListener("open", () => {});
            this.socket.addEventListener("message", (event) => {
                console.log(event.data);
            });
            this.socket.addEventListener("close", () => {
                providedUrl.removeAttribute("disabled");
                summarizeButton.removeAttribute("disabled");
            });
        }
    }
}

const summarixClient = new SummarixClient();

window.onload = () => {
    document.getElementsByTagName("body")[0].style.opacity = 1;
    introAnimation();
};

async function introAnimation() {
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

const allowedHostnames = [
    "www.youtube.com",
    "youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtube-nocookie.com",
    "youtube-nocookie.com",
];
function getVideoId(source) {
    let sourceParse = null;
    try {
        sourceParse = new URL(source);
    } catch {
        return "";
    }

    if (!allowedHostnames.includes(sourceParse.hostname)) {
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

    if (videoPreview.getAttribute("src") !== composeUrl) {
        videoPreview.src = composeUrl;

        animate(
            summarizeButton,
            { translate: openSummarize ? ["6rem", "9rem"] : "6rem" },
            { ease: [0.25, 0.25, 0, 1], duration: 0.5 }
        );

        animate(
            providedUrl,
            { translate: openSummarize ? ["0rem", "-3rem"] : "0rem" },
            { ease: [0.25, 0.25, 0, 1], duration: 0.5 }
        );
    }
}

function urlInputChange() {
    updatePreview(getVideoId(providedUrl.value));
}

function summarizeVideo() {
    summarixClient.takeover();
    summarixClient.bind();
}
