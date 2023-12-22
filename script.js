document.addEventListener('DOMContentLoaded', function() {
    const predictionForm = document.getElementById('predictionForm');
    const leaderboardList = document.getElementById('leaderboardList');
    const deceasedList = document.getElementById('deceasedList');
    let data = {
        predictions: [],
        deceased: [],
        leaderboard: []
    };

    // Function to handle prediction form submission
    predictionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userName = document.getElementById('userName').value;
        const celebrityName = document.getElementById('celebrityName').value;
        data.predictions.push({ username: userName, celebrity: celebrityName });
        document.getElementById('userName').value = '';
        document.getElementById('celebrityName').value = '';
        updateLeaderboard();
        saveData();
    });

    // Function to update the leaderboard
    function updateLeaderboard() {
        data.leaderboard = []; // Reset leaderboard
        data.predictions.forEach(prediction => {
            const deceased = data.deceased.find(celeb => celeb.name === prediction.celebrity);
            if (deceased) {
                const points = calculatePoints(deceased.age);
                addToLeaderboard(prediction.username, points);
            }
        });
        displayLeaderboard();
    }

	function calculatePoints(age) {
		return 100 - age;
	}

	// Function to add to leaderboard
	function addToLeaderboard(username, points) {
		const existingUser = data.leaderboard.find(user => user.username === username);
		if (existingUser) {
			existingUser.points += points;
		} else {
			data.leaderboard.push({ username: username, points: points });
		}
	}

	function updateLeaderboard() {
		let leaderboard = {};
		data.predictions.forEach(prediction => {
			const deceased = data.deceased.find(celeb => celeb.name === prediction.celebrity);
			if (deceased) {
				const points = calculatePoints(deceased.age);
				if (leaderboard[prediction.username]) {
					leaderboard[prediction.username] += points;
				} else {
					leaderboard[prediction.username] = points;
				}
			}
		});
		displayLeaderboard(leaderboard);
	}

	function displayLeaderboard(leaderboard) {
		leaderboardList.innerHTML = '';
		Object.keys(leaderboard).sort((a, b) => leaderboard[b] - leaderboard[a]).forEach(username => {
			const listItem = document.createElement('li');
			listItem.textContent = `${username} - ${leaderboard[username]} points`;
			leaderboardList.appendChild(listItem);
		});
	}

	function displayDeceasedCelebrities() {
		const deceasedList = document.getElementById('deceasedList');
		deceasedList.innerHTML = ''; // Clear existing list

		data.deceased.forEach(celeb => {
			const listItem = document.createElement('li');
			listItem.textContent = `${celeb.name} (${celeb.age})`;
			deceasedList.appendChild(listItem);
		});
	}
    // Fetch and save data functions (Placeholder for actual implementation)
	function fetchData() {
		fetch('data.json')
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(jsonData => {
				data.predictions = jsonData.predictions;
				data.deceased = jsonData.deceased;
				updateLeaderboard();
				displayDeceasedCelebrities(); // Add this line
			})
			.catch(error => console.error('Error fetching data:', error));
	}

	// Save data to local JSON file (Simulated for local development)
	function saveData() {
		console.log('Data saved:', data); // For local testing, log the data
		// In production, saving will be manual in the GitHub repository
	}

    // Initial data fetch and setup
    fetchData();
});
