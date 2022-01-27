'use strict';

var gBoard;
const MINE = '💣';
const MARKED = '🚩';

var gGame = {
    isOn: false,
    firstClick: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var gLevel = {
    SIZE: 8,
    MINES: 12
};

var elMsg = document.querySelector('.msg');
var gElTimer = document.querySelector('.timer');
var gIntervalId;

function init() {
    gGame.secsPassed = 0;
    gBoard = buildBoard();
    randomMines(gLevel);
    renderBoard(gBoard);
}

function buildBoard() {
    var board = [];
    var difficulty = gLevel.SIZE;
    for (var i = 0; i < difficulty; i++) {
        board[i] = [];
        for (var j = 0; j < difficulty; j++) {
            board[i][j] = createCell();
        }
    }
    return board;
}

function renderBoard(gBoard) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            currCell.minesAroundCount = setMinesNegsCount(i, j);
            var cellId = `${i} x ${j}`;
            strHTML += `<td class="cell" id="${cellId}" onmousedown="cellMarked(event)" onclick="cellClicked(this,${i}, ${j})"></td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elBoardArea = document.querySelector('.boardArea');
    elBoardArea.innerHTML = strHTML;
}

function createCell() {
    var cell =
    {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };
    return cell;
}

function setMinesNegsCount(rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var currCell = gBoard[i][j];
            if (currCell.isMine) count++;
        }
    }
    return count;
}

function cellClicked(elCell, rowIdx, colIdx) {
    if (gGame.firstClick) {
        startTimer();
        gGame.firstClick = false;
        gGame.isOn = true;
    }
    if (!gGame.isOn) return;
    var currCell = gBoard[rowIdx][colIdx];
    if (currCell.isMarked) return;
    var cellSymbol = (currCell.isMine) ? cellSymbol = MINE : currCell.minesAroundCount;
    elCell.innerText = cellSymbol;
    currCell.isShown = true;
    elCell.classList.add("clicked");
    gGame.shownCount++
    if (currCell.isMine) {
        elCell.style.backgroundColor = 'rgb(126, 0, 0)';
        gameOver();
    } else if (currCell.minesAroundCount === 0) {
        expandShown(gBoard, rowIdx, colIdx);
    }
    if (gGame.shownCount+gGame.markedCount===gLevel.SIZE**2) gameWon() 
}

function expandShown(gBoard, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (!gBoard[i][j].isShown) {
                var cellClass = `${i} x ${j}`;
                cellClass += '';
                var elZero = document.getElementById(cellClass);
                cellClicked(elZero, i, j);
            }
        }
    }
}

function gameOver() {
    gGame.isOn = false;
    elMsg.innerText = 'GAME OVER!';
    elMsg.style.color = 'red';
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) {
                var cellClass = `${i} x ${j}`;
                cellClass += '';
                var elZero = document.getElementById(cellClass);
                elZero.classList.add("clicked");
                elZero.innerText = MINE;
                currCell.isShown = true;
            }
        }
    }
    clearInterval(gIntervalId);
}

function randomMines(gLevel) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randomRow = getRandomInt(0, gLevel.SIZE - 1);
        var randomCol = getRandomInt(0, gLevel.SIZE - 1);
        if (gBoard[randomRow][randomCol].isMine) i--;
        else gBoard[randomRow][randomCol].isMine = true;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function cellMarked(ev) {
    if (gGame.firstClick) {
        startTimer();
        gGame.firstClick = false;
        gGame.isOn = true;
    }
    if (!gGame.isOn) return;
    if (ev.button === 2) {
        if (ev.path[0].classList.contains("clicked")) return;
        else {
            var cellRow = +ev.path[0].id[0];
            var cellCol = +ev.path[0].id[4];
            var currCell = gBoard[cellRow][cellCol];
            if (ev.path[0].innerText === '') {
                ev.path[0].innerText = MARKED;
                currCell.isMarked = false;
                gGame.markedCount++;
            } else {
                ev.path[0].innerText = '';
                currCell.isMarked = true;
                gGame.markedCount--;
            }
        }
    }
    if (gGame.shownCount+gGame.markedCount===gLevel.SIZE**2) gameWon() 
}

function changBoard(difficulty) {
    clearInterval(gIntervalId);
    gGame.isOn = false;
    if (difficulty === 'Beginner') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
    } else if (difficulty === 'Medium') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
    } else if (difficulty === 'Expert') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
    }
    restart();
}

function startTimer() {
    gIntervalId = setInterval(function () {
        gElTimer.innerText = (gGame.secsPassed++ / 10);
    }, 100);
}

function restart() {
    elMsg.style.color = 'white';
    elMsg.innerText = 'GOOD LUCK!';
    gGame.isOn = false;
    gGame.firstClick = true;
    gGame.secsPassed = 0;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    init();
}

function gameWon() {
    gGame.isOn = false;
    elMsg.innerText = 'AWESOME!';
    elMsg.style.color = 'greenyellow';
    clearInterval(gIntervalId);
}