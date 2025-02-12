//lab 5 1.3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50); /*公式或变量*/

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



//lab5 3.1
// let project2 = await fetchJSON('../lib/projects.json');
// let rolledData = d3.rollups(
//     project2,
//     (v) => v.length,
//     (d) => d.year,
// );
// let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year };
//   });
// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data); /*这一行和上一行相当于上面的for循环 */
// let arcs = arcData.map((d) => arcGenerator(d));


// let colors = d3.scaleOrdinal(d3.schemeTableau10); /*D3随机抽取颜色 */
// arcs.forEach((arc, idx)=> {
//     // TODO, fill in step for appending path to svg using D3
//     d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx)); /*colors变成公式了，所以用（） */
// });
// /*lab 5 2.2*/
// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//     legend.append('li') 
//           .attr('class', 'label') // Add class to <li>
//           .attr('style', `--color:${colors(idx)}`) // Set color dynamically via --color
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // Add span with class 'swatch'
// });


//lab5 step4
let query = '';
let searchInput = document.querySelector('.searchBar');
// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // filter projects
//   let filteredProjects = project2.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // render filtered projects
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });


//lab5 step 4.4
let project2 = await fetchJSON('../lib/projects.json');
// Function to render the pie chart and legend
function renderPieChart(projectsGiven) {
    // Clear previous chart and legend
    d3.select('svg').selectAll('*').remove(); // Clear SVG paths (pie slices)
    d3.select('.legend').selectAll('*').remove(); // Clear the legend items
  
    // Re-calculate rolled data (grouping projects by year)
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );
  
    // Re-calculate data in the format required for the pie chart
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  
    // Create the slice generator and arc data for the pie chart
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
  
    // Set up color scale for the pie chart
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
    // Render pie chart paths (arc slices)
    newArcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx)); // Fill with color based on index
    });
  
    // Render legend items
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
      legend.append('li')
        .attr('class', 'label')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });

    /*lab5  5.2-5.4*/
    let selectedIndex = -1;
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    newArcs.forEach((arc, i) => {
        svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
            // console.log('Clicked index:', i, 'Selected index:', selectedIndex); // Debugging log
            svg.selectAll('path').attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected': ''
            
            ));
            legend.selectAll('li').attr('class', (_, idx) =>(
                idx === selectedIndex ? 'selected': ''
            ));
                // Determine whether to filter or show all projects
        if (selectedIndex === -1) {
            // Show all projects if nothing is selected
            renderProjects(project2, projectsContainer, 'h2');
        } else {
            // Get the selected year
            let selectedYear = newData[selectedIndex].label;

            // Filter projects based on the selected year
            let filteredProjects = project2.filter(project => project.year === selectedYear);

            // Re-render the filtered projects
            renderProjects(filteredProjects, projectsContainer, 'h2');
        }
            // console.log(svg.selectAll('path')); 
        });
    });
}
  
  // Call this function on page load to render the initial chart
renderPieChart(project2); // Make sure `Projects` is defined and has your data

function setQuery(query){
    return project2.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
}
  
  // Event listener for the search input field
searchInput.addEventListener('change', (event) => {
    let query = event.target.value;
  
    // Filter the projects based on the query
    let filteredProjects = setQuery(query); // `setQuery` should return the filtered data
  
    // Re-render projects and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2'); // Assuming you have this function to render projects
    renderPieChart(filteredProjects); // Re-render the pie chart with filtered data
});
  
