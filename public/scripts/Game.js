const Game = (function() {
    let isHost = -1;
    let turn = -1;
    const size = 10;
    /*
    A size*size 2D array gamBoard
    Each gameBoard[][] store a string that indicates the element of
     */
    let gameBoard = [];
    let enemyCharacter = {
        row: 9,
        col: 9,
        live: 3,
        gem: 0,
        teleport: 10,
        isInStop: 0,
        isDeath: 0,
        isWin: 0
    };
    let myCharacter = {
        row: 0,
        col: 0,
        live: 3,
        gem: 0,
        teleport: 100,
        isInStop: 0,
        isDeath: 0,
        isWin: 0
    };
    //for making JSON file
    let gameData = {
        isHost: isHost,
        enemyCharacter: enemyCharacter,
        myCharacter: myCharacter,
        gameBoard: gameBoard
    };

    const createEmptyBoard = function () {
        /*
        Make the gameBoard UI
        This involves UI design, so it is just for my testing
        TODO: Please comment out after new UI have been made
         */
        //$("#gameArea").empty();
        for (let i = 0; i < size; i++)
            $("#gameArea").append("<div class='row'></div>");
        for (let i = 0; i < size; i++)
            $(".row").append("<div class='cell'></div>");
    }

    /*
    Randomly put elements into cells
    just do once each game
     */
    const gameBoardInit = function() {
		console.log("gameBoardInit function is called");
        //Initialize gameBoard
        for (let i = 0; i < size; i++) {
            gameBoard[i] = [];
            for (let j = 0; j < size; j++) {
                //Assign elements into cells
                gameBoard[i][j] = Math.floor(Math.random() * 6);
                switch (gameBoard[i][j]) {
                    //Space
                    case 0: gameBoard[i][j] = "Space"; break;
                    //Mine
                    case 1: gameBoard[i][j] = "Mine"; break;
                    //Live
                    case 2: gameBoard[i][j] = "Live"; break;
                    //Gem
                    case 3: gameBoard[i][j] = "Gem"; break;
                    //Wall
                    case 4: gameBoard[i][j] = "Wall"; break;
                    //Stop
                    case 5: gameBoard[i][j] = "Stop"; break;
                }
            }
        }
    };

    const setHost = function (num) {
        isHost = num;
        Game.isHost = num;
    }

    const setMyCharacter = function (chara) {
        myCharacter = chara;
        Game.player = chara;
    }

    const setEnemyCharacter = function (chara) {
        enemyCharacter = chara;
        Game.enemy = chara;
    }

    const setGameBoard = function (board) {
        gameBoard = board;
        Game.gameBoard = board;
    }

    const setTurn = function (num) {
        turn = num;
        Game.turn = num;
    }

    /*
    function to implement teleportation
    param: ClickEvent event - the mouse click event
     */
    const teleport = function (event) {
        const row = getPosition(event.target).row;
        const col = getPosition(event.target).col;
        if (myCharacter.teleport !== 0 && gameBoard[row][col] !== "Wall" && !myCharacter.isDeath) {

            if (myCharacter.isInStop) {
                gameBoard[myCharacter.row][myCharacter.col] = "Stop";
                myCharacter.isInStop = 0;
            }
            else gameBoard[myCharacter.row][myCharacter.col] = "Space";

            myCharacter.row = row;
            myCharacter.col = col;
            checkStatus();
            gameBoard[myCharacter.row][myCharacter.col] = "Me";
            myCharacter.teleport--;
        }
    };

    /*
    function to get coordinate
    param: HTMLElement cell - the element at coordinate (row, col)
    return: row - the row corresponding to that cell
    return: col - the column corresponding to that cell
     */
    const getPosition = function (cell) {
        let i;
        let j;

        for (i = 0; i < size; i++)
            if (cell.parentElement === $(".row").get(i))
                break;
        for (j = 0; j < size; j++)
            if (cell === $(".cell").get(i * 10 + j))
                break;

        return {
            row: i,
            col: j
        }
    };

    /*
    check and modify flags or player status after myCharacter's position is changed
     */
    function checkStatus() {
        if (gameBoard[myCharacter.row][myCharacter.col] === "Live") myCharacter.live++;
        else if (gameBoard[myCharacter.row][myCharacter.col] === "Gem") myCharacter.gem++;
        else if (gameBoard[myCharacter.row][myCharacter.col] === "Mine") myCharacter.live--;
        else if (gameBoard[myCharacter.row][myCharacter.col] === "Stop") myCharacter.isInStop = 1;

        if (myCharacter.live === 0) myCharacter.isDeath = 1;
    }

    /*
    update the UI each term
    This involves UI design, so it is just for my testing
    TODO: Please comment out after new UI have been made
     */
    const update = function () {
		if (!Authentication.getUser()) return;
		console.log("update function called");
        if (isHost === -1) {
            $("#Enemy-color").text("P2");
            $("#You-color").text("P1");
            gameBoard[enemyCharacter.row][enemyCharacter.col] = "P2";
            gameBoard[myCharacter.row][myCharacter.col] = "P1";
            Game.gameBoard[enemyCharacter.row][enemyCharacter.col] = "P2";
            Game.gameBoard[myCharacter.row][myCharacter.col] = "P1";
            // $("#cheat").hide()            
            // $("#Join").hide();
        }
        else {
            $("#Enemy-color").text("Enemy");
            $("#You-color").text("You");
            gameBoard[enemyCharacter.row][enemyCharacter.col] = "Enemy";
            gameBoard[myCharacter.row][myCharacter.col] = "Me";
            Game.gameBoard[enemyCharacter.row][enemyCharacter.col] = "Enemy";
            Game.gameBoard[myCharacter.row][myCharacter.col] = "Me";
        }
        //Update class of each cell according to gameBoard[][]
        for (let i = 0; i < size; i++)
            for (let j = 0; j < size; j++) {
                // $(".cell").get(i * size + j).innerText = gameBoard[i][j];
                $(".cell").get(i * size + j).setAttribute("class", "cell " + gameBoard[i][j]);
            }
        //update players' status
        $('#Me-hp').val(myCharacter.live*5);
        $('#Enemy-hp').val(enemyCharacter.live*5);
        $("#TopLives").text("Lives: " + enemyCharacter.live);
        $("#TopGems").text("Gems: " + enemyCharacter.gem);
        $("#TopTeleports").text("Teleports: " + enemyCharacter.teleport);
        $("#BottomLives").text("Lives: " + myCharacter.live);
        $("#BottomGems").text("Gems: " + myCharacter.gem);
        $("#BottomTeleports").text("Teleports: " + myCharacter.teleport);
        getWinner();
        if ((myCharacter.isWin || enemyCharacter.isWin) && isHost === -1 && Authentication.getUser()) {
            //console.log(isHost);
            $('#Win-dummy').text("are audience");
            $("#Gameover_hover").show();
        }
        else if (myCharacter.isWin) {
            $('#Win-dummy').text("Win");
            $("#Gameover_hover").show();
        }
        else if (enemyCharacter.isWin) {
            $('#Win-dummy').text("Lose");
            $("#Gameover_hover").show();
        }
        if (myCharacter.isWin || enemyCharacter.isWin) {
            if (isHost !== -1) sendWinInfo();
            Game.setHost(-1);
			console.log("set host -1");
            $(document).off("keyup");
            $(".cell").off("click");
            $("#Room-UI").show();
        }
    };

    /*
    handle players' movement
    The position is changed WHENEVER character can move one step further.
    e.g. If character can move 4 step to right, myCharacter.col will +1+1+1+1 instead of +4 directly
    TODO: so if you want to implement animation, please wait all the back-end calculation finish.
     */
    const move = function (direction) {
        //left
        if (direction === 1) {
            while (
                myCharacter.col > 0 &&
                !myCharacter.isDeath &&
                gameBoard[myCharacter.row][myCharacter.col-1] !== "Enemy" &&
                gameBoard[myCharacter.row][myCharacter.col-1] !== "Wall"
                ) {

                if (myCharacter.isInStop) {
                    gameBoard[myCharacter.row][myCharacter.col] = "Stop";
                    myCharacter.isInStop = 0;
                }
                else gameBoard[myCharacter.row][myCharacter.col] = "Space";

                myCharacter.col--;

                checkStatus();
                gameBoard[myCharacter.row][myCharacter.col] = "Me"
                if (myCharacter.isInStop) break;
            }
        }
        //up
        else if (direction === 2) {
            while (
                myCharacter.row > 0 &&
                !myCharacter.isDeath &&
                gameBoard[myCharacter.row-1][myCharacter.col] !== "Enemy" &&
                gameBoard[myCharacter.row-1][myCharacter.col] !== "Wall"
                ) {

                if (myCharacter.isInStop) {
                    console.log("leave stop");
                    gameBoard[myCharacter.row][myCharacter.col] = "Stop";
                    myCharacter.isInStop = 0;
                }
                else gameBoard[myCharacter.row][myCharacter.col] = "Space";

                myCharacter.row--;

                checkStatus();
                gameBoard[myCharacter.row][myCharacter.col] = "Me"
                if (myCharacter.isInStop) break;
            }
        }
        //right
        else if (direction === 3) {
            while (
                myCharacter.col < size - 1 &&
                !myCharacter.isDeath &&
                gameBoard[myCharacter.row][myCharacter.col+1] !== "Enemy" &&
                gameBoard[myCharacter.row][myCharacter.col+1] !== "Wall"
                ) {

                if (myCharacter.isInStop) {
                    gameBoard[myCharacter.row][myCharacter.col] = "Stop";
                    myCharacter.isInStop = 0;
                }
                else gameBoard[myCharacter.row][myCharacter.col] = "Space";

                myCharacter.col++;

                checkStatus();
                gameBoard[myCharacter.row][myCharacter.col] = "Me"
                if (myCharacter.isInStop) break;
            }
        }
        //down
        else if (direction === 4) {
            while (
                myCharacter.row < size - 1 &&
                !myCharacter.isDeath &&
                gameBoard[myCharacter.row+1][myCharacter.col] !== "Enemy" &&
                gameBoard[myCharacter.row+1][myCharacter.col] !== "Wall"
                ) {

                if (myCharacter.isInStop) {
                    gameBoard[myCharacter.row][myCharacter.col] = "Stop";
                    myCharacter.isInStop = 0;
                }
                else gameBoard[myCharacter.row][myCharacter.col] = "Space";

                myCharacter.row++;

                checkStatus();
                gameBoard[myCharacter.row][myCharacter.col] = "Me"
                if (myCharacter.isInStop) break;
            }
        }
    };

    //If someone wins, his isWin flag = 1
    const getWinner = function () {
        if (myCharacter.isDeath || myCharacter.live === 0) {
            enemyCharacter.isWin = 1;
            return;
        }
        else if (enemyCharacter.isDeath || enemyCharacter.live === 0) {
            myCharacter.isWin = 1;
            return;
        }
        for (let i = 0; i < size; i++)
            for (let j = 0; j < size; j++)
                if (gameBoard[i][j] === "Gem")
                    return;
        //if gem number same, both win.
        if (enemyCharacter.gem > myCharacter.gem) enemyCharacter.isWin = 1;
        else myCharacter.isWin = 1;
    };

    /*
    cheat function
    When cheat button is clicked, enemy status is changed.
     */
    const cheat = function () {
        if (isHost === -1) return;
        if (enemyCharacter.live !== 0) enemyCharacter.live--;
        if (enemyCharacter.gem !== 0) enemyCharacter.gem--;
        if (enemyCharacter.teleport !== 0) enemyCharacter.teleport--;
		// turn-- so it will not skip turn
        socket.emit("gameData", {isHost: Game.isHost, enemyCharacter: Game.enemy, myCharacter: Game.player, gameBoard: Game.gameBoard, turn: Game.turn-1});
    };

    return {
        //functions
        createEmptyBoard, createEmptyBoard,
        gameBoardInit: gameBoardInit,
        teleport: teleport,
        update: update,
        getWinner: getWinner,
        move: move,
        cheat: cheat,
		getPosition: getPosition,

        //getters
        gameBoardSize: size,
        gameBoard: gameBoard,
        player: myCharacter,
        enemy: enemyCharacter,
        gameData: gameData,
        isHost: isHost,
        turn: turn,

        //setters
        setHost: setHost,
        setMyCharacter: setMyCharacter,
        setEnemyCharacter: setEnemyCharacter,
        setGameBoard: setGameBoard,
        setTurn: setTurn

    };

})();