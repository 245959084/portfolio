console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/** 
navLinks = $$("nav a")

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
    currentLink.classList.add('current');
} **/

let pages = [
    {url: "https://245959084.github.io/portfolio/", title: 'Home'},
    {url: "https://245959084.github.io/portfolio/contact/index.html", title: 'Contact'},
    {url: "https://245959084.github.io/portfolio/projects/index.html", title: "Projects"},
    {url: "https://245959084.github.io/portfolio/CV/index.html", title: "Resume"}
]

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages){
    let url = p.url;
    let title = p.title;
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}
