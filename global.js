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
    {url: "https://github.com/245959084", title: "Github"}
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
    if (a.host !==  location.host){
        a.target = "_blank";
    }
    nav.append(a);
}
document.body.insertAdjacentHTML(
    'afterbegin',
        `<label class='color-scheme'>
            Theme:
            <select>
                <option value = "automatic">automatic</option>
                <option value = "dark">dark</option>
                <option value = "light">light</option>
            </select>
        </label>`
); 

const select = document.querySelector('select'); /* 里面的得是<select>*/

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value); /*更改颜色*/ 
    localStorage.colorScheme = event.target.value;/*记录颜色*/
    console.log(localStorage.colorScheme);
});

if ('colorScheme' in localStorage){
    const saved = localStorage.colorScheme;
    select.value = saved;  /*保存当前的颜色，使刷新界面以后界面的颜色还是该颜色 */
}

