const express = require("express");

const fs = require("fs");;

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app );
const io = new Server(httpServer);

//number of players who click join
let players = 0;

//the socket of the non-host player
let player = 0;

//socket of the host
let host = 0;

//Server gets a copy of gameData in order to give audience at anytime.
let serverGameData = null;

//array to store online people username
let loginMember = {};

let flag = 0;

io.on("connection", (socket) => {
	
	if (players === 2){
		socket.emit("closeJoin");
	}
	
    socket.emit("playerNumUpdate", players);
    //When new person comes in but player and host are having socket, then the person must be audience
    if (player !== 0  && host !== 0) {
        socket.emit("gameData", serverGameData, -1);
    }

    socket.on("disconnect", () => {
		// if host disconnected
        if (socket.id === host.id) {
			// console.log(serverGameData);
            if (serverGameData !== null) {
				serverGameData.myCharacter.live = 0;
				io.emit("gameData", serverGameData, -1);
			}
			if (player !== 0) {
				// swap, since server has same perspective as host
				let gameData = serverGameData;
				let temp = gameData.enemyCharacter;
				gameData.enemyCharacter = gameData.myCharacter;
				gameData.myCharacter = temp;
				player.emit("gameData", gameData, 0);
			}
            host = 0;
			players--;
        }
		// if non host disconnected
        if (socket.id === player.id) {
            if (serverGameData !== null) {
				serverGameData.enemyCharacter.live = 0;
				io.emit("gameData", serverGameData, -1);
			}
            if (host !== 0) host.emit("gameData", serverGameData, 1);
            player = 0;
			players--;
        }
        delete loginMember[socket.id];
		if (players < 0) players = 0;
		io.emit("playerNumUpdate", players);
        io.emit("memberUpdate", loginMember);
    })

    //event after clicking join button
    socket.on("join", () => {
        players++;
		console.log("number of players:" , players);
        //the first person is always host
        if (players === 1) host = socket;
        //another player joins, then send gameInit signal to host
        if (players === 2) {
            //players = 0;
			console.log("send gameInit signal...");
            player = socket;
            host.emit("gameInit", 1);
            player.emit("gameInit", 0);
            io.emit("closeJoin");
        }
        io.emit("playerNumUpdate", players);
    })

    //Event when players make movement.
    socket.on("gameData", (gameData) => {
        // IT'S BY REFERENCE.
		serverGameData = gameData; 
        gameData.turn++;
        //if data come from host
        if (gameData.isHost) {
            io.emit("gameData", gameData, -1);
            host.emit("gameData", gameData, 1);
            let temp = gameData.enemyCharacter;
            gameData.enemyCharacter = gameData.myCharacter;
            gameData.myCharacter = temp;
            player.emit("gameData", gameData, 0);
			temp = gameData.enemyCharacter;
            gameData.enemyCharacter = gameData.myCharacter;
            gameData.myCharacter = temp;
        }
        //if data come from non-host
        else {
			io.emit("gameData", serverGameData, -1);
			player.emit("gameData", gameData, 0);
			let temp = serverGameData.enemyCharacter;
            serverGameData.enemyCharacter = serverGameData.myCharacter;
            serverGameData.myCharacter = temp;
/*             let temp = gameData.enemyCharacter;
            gameData.enemyCharacter = gameData.myCharacter;
            gameData.myCharacter = temp; */
            host.emit("gameData", serverGameData, 1);
        }
		console.log();
		console.log("gameData received, serverGameData turn: ",serverGameData.turn);
		console.log("gameData received, gameData turn: ",gameData.turn);
		console.log("host:", serverGameData.myCharacter);
		console.log("non-host:", serverGameData.enemyCharacter);
    });

    socket.on("gameOver", (result, win) => {
        const {data, username} = result;
        let user = JSON.parse(fs.readFileSync("data/users.json"));
		console.log("");
		console.log("gameover");
		console.log("data:", data);
		console.log("gem:", data.gem);
		console.log("isHost:", result.isHost);
        user[result.username] = {
            password: user[username].password,
            Gem: user[username].Gem + data.gem,
            Win: user[username].Win + win
        };
        fs.writeFileSync("data/users.json", JSON.stringify(user, null, " "));
        flag++;
		
		if (flag === 1 && host === 0) {
			// in case host disconnected
			emitRanking(user);
		} else if (flag === 1 && player === 0){
			// in case non host disconnected
			emitRanking(user);
		}
		//console.log("flag number: ", flag);
        // ensure both players have submitted result to server
        if (flag === 2) {
            flag = 0;
			emitRanking(user);
        }
		players = 0;
		host = 0;
		player = 0;
		io.emit("playerNumUpdate", players);
    })
})

function emitRanking(user){
	let allPlayers = Object.keys(user);
	let max;
	for (let i = 0; i < 3 && i < allPlayers.length ; i++) {
		allPlayers = Object.keys(user);
		max = allPlayers[0];
		for (let person in user) {
			if (user[max].Win === user[person].Win) {
				if (user[max].Gem < user[person].Gem) max = person;
			}
			else if (user[max].Win < user[person].Win) max = person;
		}
		io.emit("ranking", max, user[max].Win, user[max].Gem, i);
		delete user[max];
	}
}

app.post("/signIn", (req, res) => {
    // Get the JSON data from the body
    const { username, password , socketId} = req.body;

    let user = JSON.parse(fs.readFileSync("data/users.json"));
    if (!(username in user)) {
        res.json({status: "error", error: "Incorrect username/password."});
        return;
    }
    if (password !== user[username].password) {
        res.json({status: "error", error: "Incorrect username/password."});
        return;
    }
    loginMember[socketId] = username;
    io.emit("memberUpdate", loginMember);
    res.json({status: "success"});
});

app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, password, newSocket} = req.body;

    let user = JSON.parse(fs.readFileSync("data/users.json"));
    if (username in user) {
        res.json({status: "error", error: "Username exists"});
        return;
    }
    user[username] = {password: password, Gem: 0, Win: 0};
    fs.writeFileSync("data/users.json", JSON.stringify(user, null, " "));
    loginMember[newSocket] = username;
    io.emit("memberUpdate", loginMember);
    res.json({status: "success"});
})

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});