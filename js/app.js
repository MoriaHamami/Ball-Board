'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'

const ROW_LENGTH = 10
const COL_LENGTH = 12
const HALF_ROW = Math.floor((ROW_LENGTH - 1) / 2)
const HALF_COL = Math.floor((COL_LENGTH - 1) / 2)

var gGlueIntervalId
var gBallIntervalId
var gCollectedBalls
var gCreatedBalls
var gIsOnGlue

// Model:
var gBoard
var gGamerPos

function onInitGame() {
    // TASK 2: Restart count
    var elCollectedCount = document.querySelector('.collected-count span')
    elCollectedCount.innerText = 0
    // Task 3: Restart balls count
    gCollectedBalls = 0
    gCreatedBalls = 2
    // Task 3: Hide restart button
    hideElement('button')
    // Task 7: Reset glue
    gIsOnGlue = false

    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    createBalls()
    createGlue()

}

function buildBoard() {
    const board = []

    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < ROW_LENGTH; i++) {
        board[i] = []
        for (var j = 0; j < COL_LENGTH; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            // TASK 5- add passages
            if ((i === 0 && j !== HALF_COL) || (i === ROW_LENGTH - 1 && j !== HALF_COL) || (j === 0 && i !== HALF_ROW) || (j === COL_LENGTH - 1 && i !== HALF_ROW)) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL

    return board

}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML

}

// TASK 7- Create glue
function createGlue() {

    gGlueIntervalId = setInterval(() => {
        const emptyCell = getEmptyRandCell()
        // Update Model
        gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE
        // Update DOM
        renderCell(emptyCell, GLUE_IMG)
        // Remove glue after 3 seconds
        removeGlue(emptyCell)
    }, 5000)

}

function removeGlue(currCell) {

    setTimeout(() => {
        if (gBoard[currCell.i][currCell.j].gameElement === GLUE) {
            // Update Model
            gBoard[currCell.i][currCell.j].gameElement = null
            // Update DOM
            renderCell(currCell, '')
        }
    }, 3000)

}

function createBalls() {

    gBallIntervalId = setInterval(() => {
        const emptyRandomCell = getEmptyRandCell()
        // Update Model
        gBoard[emptyRandomCell.i][emptyRandomCell.j].gameElement = BALL
        // Update DOM
        renderCell(emptyRandomCell, BALL_IMG)
        gCreatedBalls++
        //Task 6 - Count nearest balls and update DOM
        countNearestBalls()
    }, 3000)

}

function getEmptyRandCell() {
    const emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.type === FLOOR && currCell.gameElement === null) emptyCells.push({ i, j })
        }
    }
    const randIdxForBall = getRandomInt(0, emptyCells.length)
    return emptyCells[randIdxForBall]
}

function countNearestBalls() {
    var neighborsCount = countNeighbors(gGamerPos.i, gGamerPos.j, gBoard)
    var elBallsCount = document.querySelector('.balls-count span')
    elBallsCount.innerText = neighborsCount
}

// Move the player to a specific location
function moveTo(i, j) {

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Task 7- Glue
    if (gIsOnGlue) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the five allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || isPortalMove(gGamerPos.i, gGamerPos.j, i, j)) {

        if (targetCell.gameElement === BALL) ballEaten()

        // Task 7- Glue
        if (targetCell.gameElement === GLUE) {
            gIsOnGlue = true
            setTimeout(() => {
                gIsOnGlue = false
            }, 3000)
        }

        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)

        // Task 6- Count neighbors
        countNearestBalls()
    }

}

function ballEaten() {
    // Task 2- count collected balls
    countCollectedBalls()
    // Task 4- Sound when ball is eaten
    const eaten = new Audio('sound/win.mp3')
    eaten.play()
    // Task 3- Restart game if no more balls
    if (gCollectedBalls === gCreatedBalls) restartGame()
}

function countCollectedBalls() {
    var elBallCollectedCount = document.querySelector('.collected-count span')
    gCollectedBalls = ++elBallCollectedCount.innerText
}

function restartGame() {
    clearInterval(gGlueIntervalId)
    clearInterval(gBallIntervalId)
    showElement('button')
}

// Task 5- Check if the ball is on a portal, and if is going to exit of portal
function isPortalMove(currI, currJ, nextI, nextJ) {
    if (currI === 0 && currJ === HALF_COL && nextI === ROW_LENGTH - 1 && nextJ === HALF_COL) return true
    if (currI === ROW_LENGTH - 1 && currJ === HALF_COL && nextI === 0 && nextJ === HALF_COL) return true
    if (currJ === 0 && currI === HALF_ROW && nextJ === COL_LENGTH - 1 && nextI === HALF_ROW) return true
    if (currJ === COL_LENGTH - 1 && currI === HALF_ROW && nextJ === 0 && nextI === HALF_ROW) return true
    return false
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    // Task 5- Check if the ball is on a portal
    switch (event.key) {
        case 'ArrowLeft':
            if (j === 0 && i === HALF_ROW) moveTo(HALF_ROW, COL_LENGTH - 1)
            else moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (j === COL_LENGTH - 1 && i === HALF_ROW) moveTo(HALF_ROW, 0)
            else moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (j === HALF_COL && i === 0) moveTo(ROW_LENGTH - 1, HALF_COL)
            else moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (j === HALF_COL && i === ROW_LENGTH - 1) moveTo(0, HALF_COL)
            else moveTo(i + 1, j)
            break
    }

}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
