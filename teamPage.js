document.addEventListener('DOMContentLoaded', function() {
    fetchDataAndDisplayTeamInfo();
});

function fetchDataAndDisplayTeamInfo() {
    fetch('../data.json')
        .then(response => response.json())
        .then(data => {
            const teamName = getTeamNameFromFlag();
            const teamInfo = findTeamInfo(data.teams, teamName);
            displayTeamInfo(teamInfo, data.predictions);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function getTeamNameFromFlag() {
    const teamSection = document.getElementById('teamSection');
    return teamSection.dataset.teamName;
}

function findTeamInfo(teams, teamName) {
    return teams.find(team => team.name.toLowerCase() === teamName.toLowerCase());
}

function displayTeamInfo(teamInfo, predictions) {
    if (!teamInfo) return;

    const teamSection = document.getElementById('teamSection');
    teamSection.innerHTML = `<h2>${teamInfo.name}</h2>`;

    teamInfo.members.forEach(member => {
        const memberPredictions = predictions.filter(prediction => prediction.username === member);
        const memberDiv = document.createElement('div');
        memberDiv.innerHTML = `<h3>${member}</h3>`;
        memberPredictions.forEach(prediction => {
            const predictionItem = document.createElement('p');
            predictionItem.textContent = prediction.celebrity;
            memberDiv.appendChild(predictionItem);
        });
        teamSection.appendChild(memberDiv);
    });
}
