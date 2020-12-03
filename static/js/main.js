// Navbar tools from Bulma
document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
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
});

function processLinks(links) {
    links.forEach(link => {
        if (link.hostname === window.location.hostname && link.id !== "entrance") {
            link.addEventListener('click', (ev) => {
                ev.preventDefault();

                replacePage(link);
            })
        }
    })
}

async function replacePage(link) {
    let resp = await fetch(link.href);
    let html = await resp.text();

    var parser = new DOMParser();
    var newDoc = parser.parseFromString(html, "text/html");

    var newRoot = newDoc.getElementById("root");
    var root = document.getElementById("root");

    root.classList.toggle("fade");
    await sleep(1000);

    console.log(newRoot);

    root.innerHTML = newRoot.innerHTML;
    var links = root.querySelectorAll('a');
    processLinks(links);

    history.pushState(null, newDoc.title, link.pathname);

    root.classList.toggle("fade");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}