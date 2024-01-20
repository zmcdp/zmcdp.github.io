document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            displayFullDeceasedList(jsonData.deceased);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function displayFullDeceasedList(deceased) {
    const fullDeceasedList = document.getElementById('fullDeceasedList');
    deceased.forEach(celeb => {
        const listItem = document.createElement('li');
        listItem.textContent = `${celeb.name} (${celeb.age})`;
        fullDeceasedList.appendChild(listItem);
    });
}