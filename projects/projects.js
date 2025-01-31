//1.4 lab4
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const result = renderProjects(projects, projectsContainer, 'h2');


// const articles = document.querySelectorAll('article');

// articles.forEach(article => {
//     article.classList.add('project-article'); // Adds the class "project-article" to each article
// });

// const a = document.querySelectorAll('article');
const header = document.querySelector('h1');
header.textContent =`${projects.length} Projects`; //projects count the number of projects in a array
