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
    {url: "index.html", title: 'Home'},
    {url: "contact/index.html", title: 'Contact'},
    {url: "projects/index.html", title: "Projects"},
    {url: "CV/index.html", title: "Resume"},
    {url: "https://www.google.com/", title: "google"}
]

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages){
    let url = p.url;
    let title = p.title;
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    if (!ARE_WE_HOME && !url.startsWith('http')){
        url = '../' + url;
    }
    console.log(url)
    /**nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);**/
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host ===  location.host && a.pathname === location.pathname){
        a.classList.add('current');
    }
    if (a.host !== location.host){
        a.target = "_blank";
    }
    nav.append(a);
}


