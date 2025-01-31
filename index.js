//lab4 step2
import { fetchJSON, renderProjects, fetchGitHubData} from './global.js'
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0,3);

const projectsContainer = document.querySelector('.projects');
const result = renderProjects(latestProjects, projectsContainer,'h2');



//lab4 step3.3
const githubData = await fetchGitHubData('245959084');

const profileStats = document.querySelector('#profile-stats');
if (profileStats){
    profileStats.innerHTML = `
        <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd> </dl>
        <dl>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd> </dl>
        <dl>
            <dt>Follows:</dt><dd>${githubData.followers}</dd> </dl>
        <dl>
            <dt>Follwing:</dt><dd>${githubData.following}</dd> </dl>
        `;
}