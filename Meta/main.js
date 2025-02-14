//lab6 step 1
let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  }   //This function convert all string data into correspond type of data

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    commits = d3.groups(data, (d) => d.commit);
});

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        // Each 'lines' array contains all lines modified in this commit
        // All lines in a commit have the same author, date, etc.
        // So we can get this information from the first line
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        return {
            id: commit,
            url: 'https://github.com/YOUR_REPO/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            // Calculate hour as a decimal for time analysis
            // e.g., 2:30 PM = 14.5
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            // How many lines were modified?
            totalLines: lines.length,
          };
        });
    }
let a = processCommits();
console.log(a);
