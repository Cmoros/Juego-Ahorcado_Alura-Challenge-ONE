const mainStart = document.querySelector('.main-start');
const addButton = mainStart.querySelector('#add-button');
const startGameButton = mainStart.querySelector('#start-button');

const mainAdd = document.querySelector('.main-add');
const addWordInput = document.querySelector('.input-word');
const saveWordButton = document.querySelector('#save-button');
const cancelWordButton = document.querySelector('#cancel-button');

const mainGame = document.querySelector('.main-game');
const personGame = mainGame.querySelector('.person');
const newGameButton = mainGame.querySelector('#new-game-button') ;
const quitGameButton = mainGame.querySelector('#quit-button');
const triesContainer = mainGame.querySelector('.letters__char-container');
const failContainer = mainGame.querySelector('.letters__try-container');

const ahorcadoContainer = mainGame.querySelector('.main-game__ahorcado-container');
const invisibleInput = mainGame.querySelector('.input-invisible');

let starterWords = [
    'AMIGO',
    'JEFE',
    'ESDRUJULA',
    'FACCION',
];

let regExpUpperCase = /^[A-ZÑ]{2,10}$/;
let regExpOnlyLetters = /^[A-ZÑa-zñ]{2,10}$/;
let regExpOnly1Letter = /^[A-Za-zÑñ]$/;

class AhorcadoGame {
    constructor() {
        this.localStorageCheck();

        this.state = 0;
        // main-start
        startGameButton.addEventListener('click', () => {
            this.displayMainGame(mainStart);
        });
        addButton.addEventListener('click', ()=>{
            this.displayMainAdd(mainStart);
        });

        // main-add
        cancelWordButton.addEventListener('click', () => {
            this.displayMainStart(mainAdd);
            addWordInput.innerHTML = "";
        });

        saveWordButton.addEventListener('click', () => {
            let newWord = addWordInput.value.trim();
            if (this.checkAddableWord(newWord.toUpperCase())) {
                this.addNewWord(newWord);
                this.displayMainGame(mainAdd);
            } else {
                alert('No usar caracteres especiales ni tildes.')
            }
        });

        // main-game
        quitGameButton.addEventListener('click', () => {
            this.displayMainStart(mainGame);
        });

        document.addEventListener('keydown', (e) => {
            this.pressButtonEvent(e.key);
        })

        newGameButton.addEventListener('click', () => {
            this.displayMainGame(mainGame);
        })

        ahorcadoContainer.addEventListener('click', () => {
            invisibleInput.focus();
        })

        invisibleInput.addEventListener('change', (e)=>{
            this.pressButtonEvent(e.target.value);
            invisibleInput.value = "";
        })
    }
    
    localStorageCheck = () => {
        if (localStorage.ahorcadoWords && localStorage.ahorcadoWords.length > 1) {
            this.wordArray = [];
            for (let word of localStorage.ahorcadoWords.split(',')) {
                if (this.checkAddableWord(word)) {
                    this.addNewWord(word);                
                }
            }
        } else {
            this.wordArray = starterWords;
            localStorage.ahorcadoWords = this.wordArray;
        }
    }

    displayMainAdd = (originMain) => {
        this.mainChangeAnimation(originMain, mainAdd); 
        this.state = 1;
    }

    checkAddableWord = (newWord) => {
        return regExpOnlyLetters.test(newWord.trim()) && !this.wordArray.includes(newWord);
    }

    displayMainGame = (originMain) => {
        this.state = 2;
        if (originMain === mainGame) {
            this.newGameAnimation();
            return;
        }
        this.mainChangeAnimation(originMain, mainGame);
        this.startGame();
    }

    displayMainStart = (originMain) => {
        this.mainChangeAnimation(originMain, mainStart)
        this.state = 0;
    }

    addNewWord = (newWord) => {
        this.wordArray.push(newWord.trim().toUpperCase());
        localStorage.ahorcadoWords = this.wordArray;
    }

    startGame = () => {
        this.hidePerson();
        this.removeLetters();
        this.word = this.wordArray[Math.floor(Math.random() * this.wordArray.length)];
        this.tries = new Set();
        this.succesfulNumberTries = 0;
        this.failsNumber = 0;
        for (let i = 0; i < this.word.length; i++) {
            this.createSuccessDiv(i);
        }
    }

    tryLetter = (char) => {
        if (!regExpOnly1Letter.test(char)) {
            console.log('Prtuebe con una letra');
            return false;
        }
        let key = char.toUpperCase();
        if (this.tries.has(key)) {
            console.log('Ya se probó esa letra, intente nuevamente');
            return false;
        }
        let index = this.word.indexOf(key)
        this.tries.add(key);
        if (index < 0) {
            this.createFailDiv(key);
            this.failsNumber++;
            personGame.querySelector(`.person__part-${this.failsNumber}`).classList.remove('hidden');
            return false;
        } 

        while (index >= 0) {
            this.succesfulNumberTries ++;
            let targetChar = triesContainer.querySelector(`.char--${index+1}`);
            targetChar.classList.remove('hidden');
            index = this.word.indexOf(key, index+1);
        }
        return true;
    }

    createSuccessDiv = (classNumber) => {
        let fragment= new DocumentFragment();
            let container = document.createElement('div');
            container.classList.add('letters__char');
            let span = document.createElement('span');
            span.innerHTML = this.word[classNumber];
            span.classList.add('char');
            span.classList.add('hidden');
            span.classList.add(`char--${classNumber+1}`);
            let underscore = document.createElement('div');
            underscore.classList.add('underscore');
            container.appendChild(span);
            container.appendChild(underscore);
            fragment.append(container);
            triesContainer.appendChild(fragment);
    }

    createFailDiv = (key) => {
        let fragment= new DocumentFragment();
        let container = document.createElement('div');
        container.classList.add('letters__try');
        container.innerHTML = key;
        fragment.append(container);
        failContainer.appendChild(fragment);
    }

    hidePerson = () => {
        for (let i = 1; i <= 10; i++) {
            personGame.querySelector(`.person__part-${i}`).classList.add('hidden');
        }
    }

    removeLetters = () => {
        let successArray = triesContainer.querySelectorAll('.letters__char');
        successArray.forEach( success => success.remove() );
        let failArray = failContainer.querySelectorAll('.letters__try');
        failArray.forEach( fail => fail.remove() );
    }

    transitionTime = 0.25;

    mainChangeAnimation(leavingMain, appearingMain) {
        leavingMain.style.right = `${window.innerWidth/2+200}px`;
        appearingMain.style.transition = "none";
        appearingMain.style.right = `-${window.innerWidth/2+200}px`;
        setTimeout(()=> {
            leavingMain.classList.add('display-none');

            appearingMain.style.transition = `right ${this.transitionTime}s`;
            appearingMain.classList.remove('display-none');
            setTimeout(() => {
                appearingMain.style.right = "0";
                leavingMain.style.right = "0";
            }, 20)
            // setTimeout(() => {
                
            // }, this.transitionTime*1000)
        },this.transitionTime*1000)
    }

    newGameAnimation = () => {
        mainGame.style.transition = "opacity 0.5s";
        setTimeout(()=> {
            mainGame.style.opacity = "0";
        }, 10)
        setTimeout(() => {
            this.startGame();
            mainGame.style.opacity = "1";
        }, 510)
        setTimeout(() => {
            mainGame.style.transition= `right ${this.transitionTime}s`;
        }, 1020)
    }

    pressButtonEvent = (e) => {
        if (this.state !== 2) return false;
        if (!this.tryLetter(e)) {
            if (this.failsNumber === 10) {
                this.state = 4;
                alert('Perdiste!');
            }
            return;
        }
        if (this.succesfulNumberTries === this.word.length) {
            alert('Ganaste!');
            this.state = 4;
        }
    }
}

const ahorcado = new AhorcadoGame();