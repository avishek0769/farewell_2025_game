import express, { json } from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from "http"
import { disconnect } from 'process'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }

});

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
};

app.use(cors(corsOptions));
// app.options("/*", cors(corsOptions)); // Preflight for all routes

app.use(json())

// Constants and variables
const ROOM_ID = "bca-farewell-2025"
const QUESTION_TIME = 5;
const REVEAL_TIME = 3;
const TOTAL_QUESTIONS = 5;

let users = []
let usersForResults = []
let roomAdmin = {}
let roomCreated = false;
let timer = QUESTION_TIME
let currentQuestionIndex = 0
let noOfGuessed = 0

let phase = 'idle';     // 'idle' | 'answering' | 'reveal'
let tickId = null;
let peopleGuessed = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
}

function startQuestionLoop() {
    phase = 'answering';
    timer = QUESTION_TIME;

    // Tell clients a new round has begun
    io.to(ROOM_ID).emit('timer', timer);     // broadcast seconds left
    io.to(ROOM_ID).emit('questionStart', { index: currentQuestionIndex });

    tickId = setInterval(() => {
        timer--;

        if (phase === 'answering') {
            if (timer === 0) switchToReveal();
        }
        else if (phase === 'reveal') {
            if (timer === 0) nextRound();
        }
    }, 1000);
}

function switchToReveal() {
    phase = 'reveal';
    timer = REVEAL_TIME;

    // Broadcast the correct answer & stats
    io.to(ROOM_ID).emit('roundResults', peopleGuessed);
}

function nextRound() {
    noOfGuessed = 0;
    peopleGuessed = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
    };
    clearInterval(tickId);
    io.to(ROOM_ID).emit("nextRound")

    // If no more questions, finish the game
    if (++currentQuestionIndex >= TOTAL_QUESTIONS) {
        phase = 'finished';
        io.to(ROOM_ID).emit('gameFinished');
        roomCreated = false;
        // users = []
        roomAdmin = {};
        currentQuestionIndex = 0;
        noOfGuessed = 0;
        peopleGuessed = {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
        };
        clearInterval(tickId);
        console.log("Quiz finished");
        return;
    }

    startQuestionLoop();
}

function stopQuiz() {
    clearInterval(tickId);
    phase = 'idle';
    currentQuestionIndex = 0;
    io.emit('quizStopped');
}


// APIs
// Room APIs
app.get("/api/room/status", (req, res) => {
    res.status(200).json({ roomCreated })
})

app.post("/api/room/create", (req, res) => {
    const { fullname, adminPassword } = req.body;
    if (adminPassword == "a") {
        roomAdmin.fullname = fullname
        roomAdmin.avatar = "adventurer"
        roomCreated = true
        res.status(200).send("Authenticated")
    }
    res.status(402).send("Authorization error")
})

app.get("/api/room/getUsers", (req, res) => {
    res.status(200).json(users)
})

app.get("/api/room/getAdmin", (req, res) => {
    res.status(200).json(roomAdmin)
})

app.get("/api/room/initialState", (req, res) => {
    const { socketId } = req.query;

    const user = users.find(user => user.id === socketId);

    const payload = {
        userCount: users.length,
        currentQuestionIndex,
        noOfGuessed,
        totalScore: user ? user.totalScore : null,
        timer,
        phase,
    };

    res.status(200).json(payload);
});

app.get("/api/room/getResults", (req, res) => {
    const results = usersForResults.map(user => ({
        id: user.id,
        fullname: user.fullname,
        totalScore: user.totalScore,
        avatar: user.avatar
    })).sort((a, b) => b.totalScore - a.totalScore);

    console.log("Results:", results);
    console.log("Users:", usersForResults);

    res.status(200).json(results);
    // res.status(200).json([
    //     {
    //         id: 'li0E-Ek5zUIfRMCRAAAO',
    //         fullname: 'one',
    //         totalScore: 7,
    //         avatar: 'croodles'
    //     },
    //     {
    //         id: 'GTOxoWSDhdPYt2VGAAAP',
    //         fullname: 'four',
    //         totalScore: 20,
    //         avatar: 'adventurer'
    //     },
    //     {
    //         id: 'EhZKXmy6vduqwGfgAAAR',
    //         fullname: 'two',
    //         totalScore: 10,
    //         avatar: 'croodles'
    //     },
    //     {
    //         id: 'wCjlAIan0kPPJePWAAAQ',
    //         fullname: 'three',
    //         totalScore: 17,
    //         avatar: 'croodles'
    //     }
    // ]);
});

// Socket Events
io.on("connection", (socket) => {
    // Create a room
    socket.on("createRoom", (data) => {
        socket.join(ROOM_ID)
        roomAdmin.id = socket.id
    })

    // Join a room
    socket.on("joinRoom", (data) => {
        const { fullname, isAdmin } = data;
        socket.join(ROOM_ID)

        if (!isAdmin) {
            let randomNum = Math.floor(Math.random() * 6);
            const newUser = {
                id: socket.id,
                fullname,
                totalScore: 0,
                avatar: ['adventurer', 'avataaars', 'bottts', 'croodles', 'micah', 'personas'][randomNum]
            }
            io.to(ROOM_ID).emit("playerJoined", newUser)
            users.push(newUser)
        }

        // io.in(ROOM_ID).fetchSockets().then(sockets => {
        //     for (const socket of sockets) {
        //         console.log(socket.id)
        //     }
        // })
        // console.log()
    })

    // Leave a room
    socket.on("disconnect", (data) => {
        let diconnectedUser = users.find(user => user.id === socket.id);
        if (diconnectedUser) {
            usersForResults.push(diconnectedUser);
        }
        let userLeft;
        users = users.filter(user => {
            if (user.id == socket.id) userLeft = user;
            else return true
        })
        userLeft && io.to(ROOM_ID).emit("playerLeft", { playerId: socket.id, playerName: userLeft.fullname })
    })

    // Start Match
    socket.on("startMatch", () => {
        startQuestionLoop()
        io.to(ROOM_ID).emit("startingMatch")
    })

    // Option Selected
    socket.on("selectAnswer", ({ selectedOption, score }) => {
        peopleGuessed[selectedOption]++
        users = users.map(user => {
            if (user.id === socket.id) {
                user.totalScore += score;
                noOfGuessed++
            }
            return user;
        });
        console.log(users)
        io.to(ROOM_ID).emit("updatePeopleGuessed")
        // console.log(peopleGuessed)
    })

})

server.listen(3000, () => {
    console.log("Server running at 3000.....")
})