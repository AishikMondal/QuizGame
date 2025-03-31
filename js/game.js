// Quiz variables
let currentQuestion = 0;
let score = 0;
let questions = [];
let selectedOption = null;
let quizCompleted = false;
let playerId = null;
let playerName = '';
let timeLeft = 30;
let timer;

// Local questions fallback
const localQuestions = [
    {
        question: "What is the capital of France?",
        correct_answer: "Paris",
        incorrect_answers: ["London", "Berlin", "Madrid"]
    },
    {
        question: "Which planet is known as the Red Planet?",
        correct_answer: "Mars",
        incorrect_answers: ["Venus", "Jupiter", "Saturn"]
    },
    {
        question: "What is the largest mammal?",
        correct_answer: "Blue Whale",
        incorrect_answers: ["Elephant", "Giraffe", "Hippopotamus"]
    },
    {
        question: "In which year did World War II end?",
        correct_answer: "1945",
        incorrect_answers: ["1939", "1941", "1943"]
    },
    {
        question: "What is the chemical symbol for gold?",
        correct_answer: "Au",
        incorrect_answers: ["Ag", "Fe", "Hg"]
    },
    {
        question: "Who painted the Mona Lisa?",
        correct_answer: "Leonardo da Vinci",
        incorrect_answers: ["Pablo Picasso", "Vincent van Gogh", "Michelangelo"]
    },
    {
        question: "What is the largest ocean on Earth?",
        correct_answer: "Pacific Ocean",
        incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"]
    },
    {
        question: "Which country is home to the kangaroo?",
        correct_answer: "Australia",
        incorrect_answers: ["Brazil", "South Africa", "New Zealand"]
    },
    {
        question: "What is the main component of the Sun?",
        correct_answer: "Hydrogen",
        incorrect_answers: ["Helium", "Oxygen", "Carbon"]
    },
    {
        question: "How many continents are there?",
        correct_answer: "7",
        incorrect_answers: ["5", "6", "8"]
    }
];

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
const playerRankElement = document.getElementById('playerRank');
const timeDisplay = document.getElementById('time');
const errorMessage = document.getElementById('errorMessage');

// Initialize quiz
document.addEventListener('DOMContentLoaded', () => {
    // Get player info from session
    playerId = sessionStorage.getItem('currentPlayerId');
    playerName = sessionStorage.getItem('currentPlayerName') || 'Player';
    
    playerNameDisplay.textContent = playerName;
    loadQuestions();
});

async function loadQuestions() {
    try {
        // Try to fetch from API first
        const apiQuestions = await fetchQuestionsFromAPI();
        if (apiQuestions.length > 0) {
            questions = apiQuestions;
            errorMessage.style.display = 'none';
        } else {
            // Fallback to local questions
            questions = localQuestions;
            errorMessage.style.display = 'flex';
            console.log("Using local questions as fallback");
        }
        showQuestion();
    } catch (error) {
        console.error("Error loading questions:", error);
        // Use local questions if there's any error
        questions = localQuestions;
        errorMessage.style.display = 'flex';
        showQuestion();
    }
}

async function fetchQuestionsFromAPI() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching from API:", error);
        return [];
    }
}

// Timer functions
function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    updateTimerDisplay();
    timeDisplay.classList.remove('timer-warning');
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 5) {
            timeDisplay.classList.add('timer-warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timeDisplay.textContent = timeLeft;
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
    shuffleArray(allAnswers).forEach((answer) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = decodeHTML(answer);
        optionElement.addEventListener('click', () => selectOption(optionElement, answer));
        optionsElement.appendChild(optionElement);
    });
    
    nextBtn.disabled = true;
    selectedOption = null;
    startTimer();
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
    clearInterval(timer);
}

// Move to next question
function nextQuestion() {
    if (selectedOption === null && timeLeft > 0) return;
    
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
    
    if (selectedOption === correctAnswer || (timeLeft <= 0 && selectedOption === null)) {
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
            
            // Calculate rank
            const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
            const rank = sortedPlayers.findIndex(p => p.id === playerId) + 1;
            playerRankElement.textContent = `Rank: ${rank} of ${sortedPlayers.length}`;
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