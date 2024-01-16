document.addEventListener('DOMContentLoaded', function() {
    const leaderboardList = document.getElementById('leaderboardList');
    const deceasedList = document.getElementById('deceasedList');
    const teamLeaderboardList = document.getElementById('teamLeaderboardList');
    let data = {
        predictions: [],
        deceased: [],
        teams: []
    };
    fetchData();
});

function fetchData() {
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            updateIndividualLeaderboard();
            updateTeamLeaderboard();
            displayDeceasedCelebrities();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updateIndividualLeaderboard() {
    let leaderboard = {};
    data.predictions.forEach(prediction => {
        const deceased = data.deceased.find(celeb => celeb.name === prediction.celebrity);
        if (deceased) {
            const points = calculatePoints(deceased.age, deceased.bonus || 0);
            if (leaderboard[prediction.username]) {
                leaderboard[prediction.username] += points;
            } else {
                leaderboard[prediction.username] = points;
            }
        }
    });
    displayLeaderboard(leaderboard);
}

function calculatePoints(age, bonus = 0) {
    return (100 - age) + bonus;
}

function displayLeaderboard(leaderboard) {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    Object.keys(leaderboard).sort((a, b) => leaderboard[b] - leaderboard[a]).forEach(username => {
        const listItem = document.createElement('li');
        listItem.textContent = `${username} - ${leaderboard[username]} points`;
        leaderboardList.appendChild(listItem);
    });
}

function updateTeamLeaderboard() {
    let teamScores = calculateTeamScores();
    displayTeamLeaderboard(teamScores);
}

function calculateTeamScores() {
    let scores = {};
    data.teams.forEach(team => {
        scores[team.name] = team.members.reduce((total, member) => {
            const userScore = calculateUserScore(member);
            return total + userScore;
        }, 0);
    });
    return scores;
}

function calculateUserScore(username) {
    let score = 0;
    data.predictions.forEach(prediction => {
        if (prediction.username === username) {
            const deceased = data.deceased.find(celeb => celeb.name === prediction.celebrity);
            if (deceased) {
                score += calculatePoints(deceased.age, deceased.bonus || 0);
            }
        }
    });
    return score;
}

function displayTeamLeaderboard(teamScores) {
    const teamLeaderboardList = document.getElementById('teamLeaderboardList');
    teamLeaderboardList.innerHTML = '';

    Object.entries(teamScores).sort((a, b) => b[1] - a[1]).forEach(([teamName, score]) => {
        const listItem = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.textContent = `${teamName} - ${score} points`;
        anchor.href = `teams/${formatTeamNameForURL(teamName)}.html`;
        listItem.appendChild(anchor);
        teamLeaderboardList.appendChild(listItem);
    });
}

function formatTeamNameForURL(teamName) {
    return teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function displayDeceasedCelebrities() {
    const deceasedList = document.getElementById('deceasedList');
    deceasedList.innerHTML = '';
    data.deceased.forEach(celeb => {
        const listItem = document.createElement('li');
        listItem.textContent = `${celeb.name} (${celeb.age})`;
        deceasedList.appendChild(listItem);
    });
}
