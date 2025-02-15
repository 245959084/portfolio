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
    {url: "meta/index.html", title: "Meta"},
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

if ('colorScheme' in localStorage){
    console.log('yes');
    const saved = localStorage.colorScheme;
    select.value = saved;  /*保存当前的颜色，使刷新界面以后界面的颜色还是该颜色 */
    document.documentElement.style.setProperty('color-scheme', select.value);
}

select.addEventListener('input', function (event) { //选择颜色只会跑这里面的东西
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value); /*更改颜色*/ 
    localStorage.colorScheme = event.target.value;/*记录颜色*/
    console.log(localStorage.colorScheme);
    // console.log(localStorage)
});


//lab4 step1.2
export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);  
        if (!response.ok){
            throw new Error(`Failed to fetch project: ${response.statusText}`)
        }
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}


// const test  = await fetchJSON('../lib/projects.json');
// console.log(test);

//lab4 step1.3
export function renderProjects(project, containerElement, headingLevel = 'h2'){
    if (!(containerElement instanceof HTMLElement)){ //runs of container is invalid
        console.error('Invalid container element provided.');
        return; 
    }
    if (!Array.isArray(project)){
        console.error("Invalid projects data.");
        return;
    }

    containerElement.innerHTML = ''; //precents duplicate elements
    for (let proj of project){//run for each project
        const article = document.createElement('article');
        // ！！！！！
        const HOME = document.documentElement.classList.contains('home');
        if (!HOME && !proj.image.startsWith('http')){ //this is because how image is formatted in json
            proj.image = '../' + proj.image; //!!!!!!!!!
        }
        if (proj.image.startsWith('../../')){ //用来处理5.2的问题，触碰多次pie会导致我们丢失图片
            proj.image = proj.image.slice(3); //那是因为每次放到上面这个if的时候他就会往前面加个../
        } //解决办法就是看到../../就移除一个../
        console.log(proj.image)
        article.innerHTML = `
            <${headingLevel}>${proj.title}</${headingLevel}>
            <img src="${proj.image}" alt="${proj.title}">
            <p>Year: ${proj.year}</p>
            <p>${proj.description}</p>
            `;
        containerElement.appendChild(article);
    }
}
// const contain = document.querySelector(".projects")
// const test2 = renderProjects(test, contain, 'h1');
// console.log(test2);

//lab4 step3.2
export async function fetchGitHubData(username){
    return fetchJSON(`https://api.github.com/users/${username}`);
}

