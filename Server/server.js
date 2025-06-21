import express, { json } from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from "http"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors())
app.use(json())

// Constants and variables
const ROOM_ID = "bca-farewell-2025"
let users = []
let roomAdmin = {}
let roomCreated = false;
let timer = 0
let currentQuestionIndex = 0


// APIs
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

app.get("/api/room/getUsersCount", (req, res) => {
    res.status(200).json({ userCount: users.length })
})

app.get("/api/room/getAdmin", (req, res) => {
    res.status(200).json(roomAdmin)
})

app.get("/api/room/getCurrentQuestionIndex", (req, res) => {
    res.status(200).json({ currentQuestionIndex })
})

app.get("/api/user/getTotalScore", (req, res) => {
    const { socketId } = req.query
    console.log("Got", socketId)
    const user = users.find(user => user.id == socketId)
    if(user) res.status(200).json({ totalScore: user.totalScore })
})

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
        
        if(!isAdmin){
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

        io.in(ROOM_ID).fetchSockets().then(sockets => {
            for (const socket of sockets) {
                console.log(socket.id)
            }
        })
        console.log()
    })

    // Leave a room
    socket.on("disconnect", (data) => {
        let userLeft;
        users = users.filter(user => {
            if (user.id == socket.id) userLeft = user;
            else return true
        })
        userLeft && io.to(ROOM_ID).emit("playerLeft", { playerId: socket.id, playerName: userLeft.fullname })
    })

    // Start Match
    socket.on("startMatch", () => {
        io.to(ROOM_ID).emit("startingMatch")
    })
})

server.listen(3000, () => {
    console.log("Server running at 3000.....")
})