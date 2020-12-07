var subtitle = require('subtitle');
global.window.subtitle = subtitle;

const transcriptURLS = {
    "lara": "/srt/lara.srt",
    "ellen": "/srt/ellen.srt",
    "gabe": "/srt/gabe.srt"
};

const audioURLS = {
    "lara": "/audio/lara.m4a",
    "ellen": "/audio/ellen.m4a",
    "gabe": "/audio/gabe.m4a"
};

window.onpopstate = function (event) {
    console.log(event);
    if (event.state) {
        var url = new URL(event.state);
        replacePage(url.href, url.pathname, true);
    }
};

function initPage(hard) {
    console.log("Initializing page...")

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        console.log("Found navbar to init")

        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            console.log("Adding onclick to:");
            console.log(el);
            el.addEventListener('click', () => {

                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');

            });
        });
    }

    const links = document.querySelectorAll('a');
    processLinks(links);

    const transcripts = document.getElementsByClassName('transcript');
    renderTranscripts(transcripts);

    if (hard) {
        const audioSelector = document.getElementById("audio-selector");
        if (audioSelector !== null) {
            audioSelector.addEventListener('change', ev => {
                loadAudio(audioSelector.value);
            });
            loadAudio(audioSelector.value);
        }

        const transcriptButton = document.getElementById("goto-transcript");
        transcriptButton.addEventListener('click', ev => {
            ev.preventDefault();
            var person = audioSelector.value;
            if (person === "") {
                return;
            }
            var link = "/transcripts/" + person + "/";
            transcriptButton.href = link;
            replacePage(transcriptButton.href, transcriptButton.pathname, false);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initPage(true);
    window.history.replaceState(window.location.href, window.title, window.location.pathname);
});

function processLinks(links) {
    links.forEach(link => {
        if (link.hostname === window.location.hostname && link.id !== "entrance") {
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                replacePage(link.href, link.pathname, false);
            })
        }
    });
}

async function replacePage(href, pathname, back) {
    let resp = await fetch(href);
    let html = await resp.text();

    var parser = new DOMParser();
    var newDoc = parser.parseFromString(html, "text/html");

    var newRoot = newDoc.getElementById("root");
    var root = document.getElementById("root");

    root.classList.toggle("fade");
    await sleep(1050);

    root.innerHTML = newRoot.innerHTML;
    document.title = newDoc.title;

    if (!back) {
        history.pushState(href, newDoc.title, pathname);
    }

    initPage(false);

    await sleep(50)

    root.classList.toggle("fade");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function renderTranscripts(transcripts) {
    for (var transcript of transcripts) {
        var person = transcript.getAttribute('person');
        var full = transcript.hasAttribute('full');

        if (full) {
            renderFullTranscript(person, transcript);
        } else {
            renderPartialTranscript(transcript);
        }
    }
}

function seekToMillis(ev) {
    var controller = document.getElementById("audio-controller");

    var time = ev.target.getAttribute("millis");
    var person = ev.target.getAttribute("person");
    const audioSelector = document.getElementById("audio-selector");

    if (audioSelector.value !== person) {
        audioSelector.value = person;
    }
    loadAudio(person);
    controller.currentTime = Number(time) / 1000;
    controller.play();
}

function convertMillis(millis) {
    let padToTwo = number => number <= 99 ? `0${number}`.slice(-2) : number;

    var seconds = millis / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    return Math.floor(hours) + ":" + padToTwo(Math.floor(minutes) % 60) + ":" + padToTwo(Math.floor(seconds) % 60);
}

async function renderFullTranscript(person, el) {
    var url = transcriptURLS[person];
    var resp = await fetch(url);
    var srt = await resp.text();

    var nodes = window.subtitle.parseSync(srt);

    var columns = document.createElement("div");
    columns.classList.value = "columns is-multiline";

    for (var node of nodes) {
        var parts = node.data.text.split(":");
        var name = parts[0].trim();
        if (parts.length < 2) {
            console.log(name);
        }
        var text = parts[1].trim().replace(/---/g, "—");

        var metaParent = document.createElement("div");
        metaParent.classList.value = "column is-2";
        metaParent.id = node.data.start.toString();
        var metaInner = document.createElement("p");
        var speaker = document.createElement("strong");
        speaker.innerText = name + ": ";
        var timestamp = document.createElement("em");
        timestamp.classList.value = "timestamp";
        timestamp.setAttribute("millis", node.data.start.toString());
        timestamp.setAttribute("person", person);
        timestamp.innerText = "(" + convertMillis(node.data.start) + ")";
        timestamp.addEventListener("click", ev => seekToMillis(ev));

        metaInner.appendChild(speaker);
        metaInner.appendChild(timestamp);
        metaParent.appendChild(metaInner);

        var textParent = document.createElement("div");
        textParent.classList.value = "column is-10";
        var textInner = document.createElement("p");
        textInner.innerText = text;
        textParent.appendChild(textInner);

        columns.appendChild(metaParent);
        columns.appendChild(textParent);
    }

    el.appendChild(columns);
}

async function renderPartialTranscript(transcript) {
    var timestamp = transcript.querySelector(".timestamp");
    timestamp.addEventListener("click", ev => seekToMillis(ev));
}

function loadAudio(person) {
    var controller = document.getElementById("audio-controller");
    if (person === "") {
        controller.removeAttribute("src");
    }

    if (controller.getAttribute("src") !== audioURLS[person]) {
        controller.setAttribute("src", audioURLS[person]);
    }
}