// Quiz variables
let currentQuestion = 0;
let score = 0;
let questions = [];
let selectedOption = null;
let quizCompleted = false;
let playerId = null;
let playerName = '';

// DOM elements
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const questionNumberElement = document.getElementById('questionNumber');
const progressBar = document.getElementById('progressBar');
const quizContent = document.getElementById('quizContent');
const resultContainer = document.getElementById('resultContainer');
const finalScoreElement = document.getElementById('finalScore');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const playerScoreElement = document.getElementById('playerScore');

// Initialize quiz
document.addEventListener('DOMContentLoaded', () => {
    // Get player info from session
    playerId = sessionStorage.getItem('currentPlayerId');
    const players = JSON.parse(localStorage.getItem('quizPlayers')) || [];
    const player = players.find(p => p.id === playerId);
    
    if (player) {
        playerName = player.name;
        playerNameDisplay.textContent = player.name;
    }
    
    fetchQuestions();
});

// Fetch questions from Open Trivia DB API
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await response.json();
        questions = data.results;
        showQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionElement.textContent = "Failed to load questions. Please try again later.";
    }
}

// Display current question
function showQuestion() {
    if (currentQuestion >= questions.length) {
        endQuiz();
        return;
    }
    
    const question = questions[currentQuestion];
    questionElement.textContent = decodeHTML(question.question);
    questionNumberElement.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
    playerScoreElement.textContent = `Score: ${score}`;
    
    // Combine correct and incorrect answers
    const allAnswers = [...question.incorrect_answers, question.correct_answer];
    
    // Shuffle answers
    optionsElement.innerHTML = '';
    shuffleArray(allAnswers).forEach((answer, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = decodeHTML(answer);
        optionElement.addEventListener('click', () => selectOption(optionElement, answer));
        optionsElement.appendChild(optionElement);
    });
    
    nextBtn.disabled = true;
    selectedOption = null;
}

// Select an option
function selectOption(optionElement, answer) {
    if (quizCompleted) return;
    
    // Remove previous selection
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Mark selected option
    optionElement.classList.add('selected');
    selectedOption = answer;
    nextBtn.disabled = false;
}

// Move to next question
function nextQuestion() {
    if (selectedOption === null) return;
    
    // Check if answer is correct
    const correctAnswer = questions[currentQuestion].correct_answer;
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        if (option.textContent === decodeHTML(correctAnswer)) {
            option.classList.add('correct');
        }
        
        if (option.classList.contains('selected') && option.textContent !== decodeHTML(correctAnswer)) {
            option.classList.add('incorrect');
        }
        
        option.style.cursor = 'default';
    });
    
    if (selectedOption === correctAnswer) {
        score += 10;
        playerScoreElement.textContent = `Score: ${score}`;
    }
    
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        setTimeout(showQuestion, 1500);
    } else {
        setTimeout(endQuiz, 1500);
    }
}

// End the quiz
function endQuiz() {
    quizContent.style.display = 'none';
    resultContainer.style.display = 'block';
    finalScoreElement.textContent = `${score} points`;
    
    // Update player score in storage
    if (playerId) {
        const players = JSON.parse(localStorage.getItem('quizPlayers')) || [];
        const playerIndex = players.findIndex(p => p.id === playerId);
        
        if (playerIndex !== -1) {
            players[playerIndex].score = Math.max(players[playerIndex].score, score);
            localStorage.setItem('quizPlayers', JSON.stringify(players));
        }
    }
    
    quizCompleted = true;
}

// Helper functions
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);