'use strict'

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].gameElement === BALL) neighborsCount++
        }
    }
    return neighborsCount
}

function renderBoard(board) {
    var strHTML = ''
    var currNum = 0
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            renderCell(i, j, currNum, 'gold')
            const className = currNum++
            strHTML += `<td data-i="${i}" data-j="${j}" onclick="onCellClicked(this, ${i}, ${j})" class="${className} ">${cell}</td>`
        }
        strHTML += '</tr>'

    }
    const elBoard = document.querySelector('tbody.board')
    elBoard.innerHTML = strHTML
}

function shuffle(items) {
    var randIdx, keep
    for (var i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length)
        keep = items[i]
        items[i] = items[randIdx]
        items[randIdx] = keep
    }
    return items
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function startTimer() {
    gStartTime = Date.now() 
    gInterval = setInterval(() => {
        const seconds = (Date.now() - gStartTime) / 1000
        var elH2 = document.querySelector('.time')
        elH2.innerText = seconds.toFixed(3)
    }, 50);
}

function resetTime() {
    var elH2 = document.querySelector('.time')
    elH2.innerText = '0.000'
}

function hideElement(selector) {
    const el = document.querySelector(selector)
    el.classList.add('hidden')
}

function showElement(selector) {
    const el = document.querySelector(selector)
    el.classList.remove('hidden')
}