//lab6 step 1
let data = [];
let commits = [];
let xScale;
let yScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    displayStats() //step1.3
  }   //This function convert all string data into correspond type of data
//-----------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
    brushSelector(); //!!!!
    commits = d3.groups(data, (d) => d.commit);
});
//-------------------------------------------
function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }
//-----------------------------------------
  function displayStats() {
    // Process commits first
    processCommits();

    const fileLengths = d3.rollups(
      data,
      (v) => d3.max(v, (v) => v.line),
      (d) => d.file
    );
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]).toFixed(2);
  
    const workByPeriod = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC:</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Commits:');
    dl.append('dd').text(commits.length);

    dl.append('dt').text('First url length:');
    dl.append('dd').text(commits[0]['url'].length);

    dl.append('dt').text('User name:');
    dl.append('dd').text(commits[0]['author']);

    dl.append('dt').text('2nd data file:');
    dl.append('dd').text(data[55]['file']);

    dl.append('dt').text('average file length:');
    dl.append('dd').text(averageFileLength);

    dl.append('dt').text('Period with most work:');
    dl.append('dd').text(maxPeriod);
    // console.log(data);
    // console.log(commits);
  }
//-------------- step 2
function createScatterplot(){
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');  //create the SVG using D3

  //step 2.2
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  xScale = d3 //create x-scale
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();
//create y-scale
yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
// const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  

  // Create the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3 //y-axis is being adjust to look like time
  .axisLeft(yScale) //step2.2 FYI
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);

  //This part combines creating scatter + hover step 3 + step 4.1
const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 20]); // adjust the range as needed

// Sort commits by total lines in descending order
const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
// console.log(sortedCommits);
// Select the dots group
const dots = svg.append('g').attr('class', 'dots');
// Plot dots and bind data
dots
.selectAll('circle')
.data(sortedCommits)  // Use sortedCommits here
.join('circle')
.attr('cx', (d) => xScale(d.datetime))  // X position based on datetime
.attr('cy', (d) => yScale(d.hourFrac))  // Y position based on hour fraction
.attr('r', (d) => rScale(d.totalLines))  // Use the radius scale based on totalLines
.attr('com', (d) => d.id)
// .style('fill', 'orange')  // Set the fill color for dots
// .style('fill-opacity', 0.5)  // Set initial opacity for dots
.on('mouseenter', function (event, d) {  // Event for mouse enter
  // Update tooltip content with commit data
  updateTooltipContent(d);
  updateTooltipVisibility(true);  // Show tooltip
  updateTooltipPosition(event);  // Position tooltip near the mouse
  
  // Increase opacity of the dot on hover
  d3.select(this).style('fill-opacity', 1);
})
.on('mouseleave', function () {  // Event for mouse leave
  // Clear tooltip content and hide tooltip
  updateTooltipContent({});
  updateTooltipVisibility(false);
  
  // Restore opacity when mouse leaves the dot
  d3.select(this).style('fill-opacity', 0.7);
});

  //step 2.3
  // Add gridlines BEFORE the axes
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
}


//step 3.1
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  // console.log(Object.keys(commit));

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

//step3.3
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

//step 3.4 <-lab6 Positioning the tooltip near the mouse cursor
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}


// Function to initialize the brush selector
function brushSelector() {
  const svg = document.querySelector('svg');

  d3.select(svg)
    .call(d3.brush().on('start brush end', brushed));  

  // Raise the dots and overlay so that they appear above the rest of the elements
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

// Global variable to store brush selection state
let brushSelection = null;

// Function to handle brush events
function brushed(event) {
  brushSelection = event.selection;  // Store the brush selection
  // console.log('Brush Selection:', brushSelection);
  updateSelection();  // Update the visual state of dots based on the selection
  updateSelectionCount();
  updateLanguageBreakdown();
}

// Function to check if a commit is selected
function isCommitSelected(commit) {
  if (!brushSelection)  return false;  // No selection, so return false
  // console.log('Brush Selection:', brushSelection);
  // console.log('Commit:', commit);

  // Extract the brush selection bounds (min and max coordinates)
  const [x0, y0] = brushSelection[0];  // top-left corner
  const [x1, y1] = brushSelection[1];  // bottom-right corner

  // Get the commit's position using the scales
  const x = xScale(commit.datetime);  // Assuming commit has a 'datetime' field
  const y = yScale(commit.hourFrac);  // Assuming commit has a 'hourFrac' field
  
  // Check if the commit is inside the brush selection
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

// Function to update visual state based on selection
function updateSelection() {
  d3.selectAll('circle')  // Assuming your dots are circles
    .classed('selected', (d) => isCommitSelected(d));  // Add 'selected' class if inside selection
}

// Function to update the count of selected commits
// function updateSelectionCount() { !!!!!!!!
//   // commits.filter(isCommitSelected): []
//   const selectedCommits = brushSelection ? commits.filter(isCommitSelected): [];
//   console.log(`That is ${commits.filter(isCommitSelected)}`);
//   // Update the UI with the selected commit count
//   const countElement = document.getElementById('selection-count');
//   countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
//   // console.log(selectedCommits);
//   // console.log('brub');
//   return selectedCommits;
// }

function updateSelectionCount() {
  const selectedCommits = d3.selectAll('circle.selected').size();  // Get number of selected circles
  
  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${selectedCommits || 'No'} commits selected`;
  //console.log(selectedCommits);  // Optionally log the selected count
}

// // (Optional) Function to update the language breakdown
// function updateLanguageBreakdown() {
//   const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
//   const container = document.getElementById('language-breakdown');
  
//   if (selectedCommits.length === 0) {
//     container.innerHTML = '';  // Clear breakdown if no commits are selected
//     return;
//   }
  
//   const requiredCommits = selectedCommits.length ? selectedCommits : commits;
//   const lines = requiredCommits.flatMap((d) => d.lines);  // Assuming lines is an array
  
//   // Create a language breakdown (count lines per language)
//   const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);

//   // Update the UI with the language breakdown
//   container.innerHTML = '';
//   for (const [language, count] of breakdown) {
//     const proportion = count / lines.length;
//     const formatted = d3.format('.1~%')(proportion);

//     container.innerHTML += `
//       <dt>${language}</dt>
//       <dd>${count} lines (${formatted})</dd>
//     `;
//   }
  
//   return breakdown;
// }

function updateLanguageBreakdown() {
  // Get the number of selected commits by counting the number of selected circles
  const selectedCommitCount = d3.selectAll('circle.selected').size();
  const container = document.getElementById('language-breakdown');
  
  // If no commits are selected, clear the container
  if (selectedCommitCount === 0) {
    container.innerHTML = '';
    return;
  }


  // Get the selected commits by filtering circles with 'selected' class
  const selectedCommits = commits.filter((commit) =>
  d3.select(`circle[com="${commit[0]}"]`).classed('selected'));
  
  // console.log(selectedCommits);
  const lines = selectedCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    // (d) => d.type // Assuming 'type' is the language of the lines
  );

  // Update DOM with breakdown
  container.innerHTML = ''; // Clear the container before adding new content
  // console.log(breakdown);
  let list = [breakdown];

  // Iterate through the breakdown and create a summary for each language
  for (const count of list) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dd>${count} lines (${formatted})</dd>
    `;
  }

  return list;
}

