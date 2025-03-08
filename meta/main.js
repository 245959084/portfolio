let data = [];
let commits = [];
let brushSelection = null;
let xScale, yScale; // Declare global variables
let selectedCommits = [];
let filteredCommits = [];

// Function to load data and initialize everything
async function loadData() {
  // Load data
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line, // Convert to number
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  // After data is loaded, process commits
  processCommits();

  // // Call functions that depend on the data
  // displayStats();
  // createScatterplot();
  
    //lab 8 step 1
  let commitProgress = 100;
  let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
  let commitMaxTime = timeScale.invert(commitProgress);

  //set up the slider input event listener
  let slider = document.getElementById('time-slider');
  let timeDisplay = document.getElementById('selected-time');

  //Function to update the time display based on the slider value
  function updateCommitTime(){
    commitProgress = Number(slider.value); //get current slider value
    commitMaxTime = timeScale.invert(commitProgress); //get the time
    //make time into string
    timeDisplay.textContent = commitMaxTime.toLocaleString();
    //lab 8 step 1.2
    filteredCommits = commits.filter((commit) => commit.datetime <= commitMaxTime);
        //lab step2.3
        let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
        //lab8 step2.1
        let lines = filteredCommits.flatMap((d) => d.lines);
        let files = [];
        files = d3
          .groups(lines, (d) => d.file)
          .map(([name, lines]) => {
            return {name, lines};
          })
        //lab 8 step 2.3
        files = d3.sort(files, (d) => -d.lines.length);
    
        d3.select('.files').selectAll('div').remove();
        let filesContainer = d3.select('.files')
          .selectAll('div')
          .data(files)
          .enter()
          .append('div'); //create div for each file
    
        //Append <dt> for the file name
        filesContainer.append('dt')
        .append('code')
        .text(d => d.name); //Display the file name
        
        //lab 8 2.2
        //Append <dd> for the number of lines in the file
        filesContainer.append('dd')
          .selectAll('div') // For each file, create a div for each line
          .data(d => d.lines)// Bind each line of the file
          .enter() 
          .append('div') // Create a div for each line
          .attr('class', 'line') // Assign the class 'line' to each div
          .style('background', d =>  fileTypeColors(d.type)); //apply color base on line
        
        filesContainer.append('dt')
        .append('code')
        .text(d => `${d.lines.length} lines`); //number of lines
          

    updateScatterplot(filteredCommits);
        }
    updateCommitTime();
    slider.addEventListener('input', updateCommitTime);
    displayStats();
      }

  // Function to process commits into a structured format
  function processCommits() {
  console.log(data);
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/245959084/portfolio/commit/' + commit,
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
        configurable: false,
        writable: false,
        enumerable: false,
      });

      return ret;
    });
}


// Function to display statistics (after commits are processed)
function displayStats() {
  // Create some basic stats (e.g., file length, average, etc.)
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

  // Create the stats display
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  dl.append('dt').html('Total LOC:');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Commits:');
  dl.append('dd').text(commits.length);
  dl.append('dt').text('First commit URL length:');
  dl.append('dd').text(commits[0]['url'].length);
  dl.append('dt').text('Average file length:');
  dl.append('dd').text(averageFileLength);
  dl.append('dt').text('Period with most work:');
  dl.append('dd').text(maxPeriod);
}

// Create the scatter plot (after commits are processed)
function updateScatterplot(filteredCommits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  //lab 8 1.2
  d3.select('svg').remove(); //first clear the svg
  //added
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, (d) => d.datetime)) //lab8 1.2
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  console.log(yScale);

  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);



  //lab8 1.2
  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([6, 50]);

  //lab8 1,2
  svg.selectAll('g').remove(); //clear the scatters in order to re-draw
  const dots = svg.append('g').attr('class', 'dots');

  //lab8 1,2
  dots.selectAll('circle').remove();
  dots
    .selectAll('circle')
    .data(filteredCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, d) {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      d3.select(event.currentTarget).classed('selected', isCommitSelected(d));
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    })
    .on('mousemove', (event) => updateTooltipPosition(event));

  const brush = d3.brush().extent([[0, 0], [width, height]]).on('start brush end', brushed);
  svg.append('g').attr('class', 'brush').call(brush);

  svg.selectAll('.dots, .overlay ~ *').raise();
}


// Brush function
function brushed(event) {
  let brushSelection = event.selection;
  selectedCommits = !brushSelection
    ? []
    : commits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.datetime);
        let y = yScale(commit.hourFrac);
        return x >= min.x && x <= max.x && y > min.y && y <= max.y;
      });
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
}

function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');
  if (selectedCommits.length === 0) {
    container.innerHTML = `
      <dt>Wow, great choice!</dt>
      <dd>␀</dd>
    `;
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);

  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleString('en', {
    timeStyle: 'short',
  });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 8}px`;
  tooltip.style.top = `${event.clientY}px`;
}

// Initialize everything
loadData();


