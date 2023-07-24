

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate');
    const closeModalButton = document.getElementById('closeModal');
    const modal = document.getElementById('modal');
    const wordList = document.getElementById('wordList');


    

    generateButton.addEventListener('click', async () => {
        const letters = document.getElementById('letters').value;
    
        if (letters.length > 7) {
            alert("Please input 7 letters or less to avoid long processing times.");
            return;
        }
    
        // Show the modal with the loading bar
        showModal();
    
        const permutations = generatePermutations(letters);
        const totalPermutations = permutations.length;
        const uniqueWords = new Set();
    
        for (let i = 0; i < permutations.length; i++) {
            try {
                const words = await fetchWords(permutations[i]);
                words.forEach(word => uniqueWords.add(word));
    
                // Update loading progress
                const percentageComplete = ((i + 1) / totalPermutations) * 100;
                updateLoadingProgress(percentageComplete);
            } catch (err) {
                console.error('Error:', err);
            }
        }
    
        // Once words are generated, hide the loading bar and show the generated words
        displayWords([...uniqueWords]);
        showModal(true); // show the words now
    });
    
    
    

    closeModalButton.addEventListener('click', () => {
        hideModal();
    });
    wordList.addEventListener('click', function(event) {
        const targetWord = event.target.previousElementSibling.textContent.trim();
        if (event.target.classList.contains('meaning-btn')) {
            fetchMeaning(targetWord);
        }
    });
    
    function displayWords(words) {
        if (words.length === 0) {
            wordList.innerHTML = "There is no such word with your given letters, TRY AGAIN!";
        } else {
            wordList.innerHTML = words.map(word => 
                `<li class="flex flex-col items-center mb-2">
                    <div class="word-container mb-2">${word}</div>
                    <button class="meaning-btn transition-transform transform hover:scale-105 bg-black opacity-60  text-white rounded px-0.5 py-0.5 border border-black inline-flex items-center">
                        👉 Meaning
                    </button>
                </li>`
            ).join('');
        }
    }
    
    
        

    function showModal(showWords = false) {
        modal.classList.remove('hidden');
        
        const modalTitle = document.getElementById('modalTitle');
        const loadingContainer = document.getElementById('loadingContainer');
        const wordListElement = document.getElementById('wordList');
        const closeButton = document.getElementById('closeModal');
        
        if (showWords) {
            modalTitle.textContent = "Generated Words:";
            wordListElement.classList.remove('hidden');
            loadingContainer.classList.add('hidden');
            closeButton.classList.remove('hidden');  // Show close button
        } else {
            modalTitle.textContent = "Loading...";
            wordListElement.classList.add('hidden');
            loadingContainer.classList.remove('hidden');
            closeButton.classList.add('hidden');  // Hide close button
        }
    }
    async function getMeaning(event) {
        const word = event.target.getAttribute('data-word');
        
        try {
            const meaning = await fetchMeaningFromGoogle(word);
            alert(meaning);  // Display the meaning however you like
        } catch (error) {
            console.error('Error fetching meaning:', error);
        }
    }
    
    function fetchMeaning(word) {
        const endpoint = `https://www.googleapis.com/customsearch/v1?q=${word}&key=AIzaSyCIsmqCP8Ke6RKg9C912h6RPRFx6xfyML4&cx=33ef09a0a392f4538`;
    
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    const description = data.items[0].snippet;
                    displayMeaningModal(word, description);
                } else {
                    displayMeaningModal(word, "No results found.");
                }
            })
            .catch(error => {
                console.error("There was an error fetching the meaning.", error);
                displayMeaningModal(word, "There was an error fetching the meaning.");
            });
    }
    
    function displayMeaningModal(word, description) {
        const meaningModal = document.getElementById('meaningModal');
        const meaningModalTitle = document.getElementById('meaningModalTitle');
        const meaningDescription = document.getElementById('meaningDescription');
        const closeMeaningModal = document.getElementById('closeMeaningModal');
    
        // Set the word and its meaning in the modal
        meaningModalTitle.textContent = `Meaning of ${word}:`;
        meaningDescription.textContent = description;
    
        // Show the modal with the meaning using transition
        meaningModal.style.display = 'flex'; // First make it visible but with opacity: 0
        setTimeout(() => {
            meaningModal.style.opacity = '1'; // Then fade it in
        }, 10); // A slight delay to ensure display: flex is applied first
    
        // Add event listener to close button
        closeMeaningModal.addEventListener('click', hideMeaningModal);
    }
    
    function hideMeaningModal() {
        const meaningModal = document.getElementById('meaningModal');
        meaningModal.style.opacity = '0'; // Fade out
        setTimeout(() => {
            meaningModal.style.display = 'none'; // Then hide it completely
        }, 300); // After the fade-out transition completes
    }
    

    async function fetchWords(letters) {
        const API_URL = `https://api.datamuse.com/words?sp=${letters}`;
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
    
        // Filter out words which have extra letters not in the user input
        const originalLettersSet = new Set(letters.split(''));
        const validWords = data.filter(item => {
            const wordSet = new Set(item.word.split(''));
            for (let char of wordSet) {
                if (!originalLettersSet.has(char)) {
                    return false;
                }
            }
            return true;
        });
    
        return validWords.map(item => item.word);
    }
    

    function generatePermutations(string) {
        const results = [];

        if (string.length === 1) {
            results.push(string);
            return results;
        }

        for (let i = 0; i < string.length; i++) {
            const firstChar = string[i];
            const charsLeft = string.substring(0, i) + string.substring(i + 1);
            const innerPermutations = generatePermutations(charsLeft);
            for (let j = 0; j < innerPermutations.length; j++) {
                results.push(firstChar + innerPermutations[j]);
            }
        }
        return results;
    }
});

function showLoading() {
    document.getElementById('loadingContainer').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingContainer').classList.add('hidden');
}

function updateLoadingProgress(percentage) {
    const progressElement = document.getElementById('loadingProgress');
    const percentageElement = document.getElementById('loadingPercentage');

    progressElement.style.width = `${percentage}%`;
    percentageElement.textContent = `${percentage.toFixed(2)}%`;
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// ... [Previous JavaScript Code]

function displayImageModal(imageUrl, word) {
    const imageModal = document.getElementById('imageModal');
    const imageModalTitle = document.getElementById('imageModalTitle');
    const displayedImage = document.getElementById('displayedImage');
    const closeImageModal = document.getElementById('closeImageModal');

    // Set the word and its image in the modal
    imageModalTitle.textContent = `Image of ${word}:`;
    displayedImage.src = imageUrl;

    // Show the modal with the image using transition
    imageModal.style.opacity = '1'; // Show with full opacity
    imageModal.style.zIndex = '9999'; // Ensure it's above everything else
    imageModal.classList.remove('hidden'); // Ensure it's displayed

    // Add event listener to close button
    closeImageModal.addEventListener('click', () => {
        imageModal.style.opacity = '0'; // Fade out
        setTimeout(() => {
            imageModal.style.zIndex = '-1'; // Ensure it's behind everything else
            imageModal.classList.add('hidden'); // Then hide it completely
        }, 300); // After the fade-out transition completes
    });
}

//First popup:
document.addEventListener('DOMContentLoaded', function() {
    // Show the popup as soon as the document is loaded
    const popup = document.getElementById('popup');
    popup.classList.remove('hidden');

    // Close the popup when the "Understood" button is clicked
    const closeButton = document.getElementById('closePopup');
    closeButton.addEventListener('click', function() {
        popup.classList.add('hidden');
    });
});



window.onload = function() {
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}




