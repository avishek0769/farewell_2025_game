import express, { json } from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from "http"

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(cors())
app.use(json())

// Constants and variables
const ROOM_ID = "bca-farewell-2025"
let users = []
let roomAdmin = {}
let roomCreated = false;


// APIs
app.get("/api/room/status", (req, res) => {
    res.status(200).json({ roomCreated })
})

app.post("/api/room/create", (req, res) => {
    const { fullname, adminPassword } = req.body;
    if(adminPassword == "nokia1234ABCD") {
        roomAdmin.fullname = fullname
        roomAdmin.avatar = "adventurer"
        roomCreated = true
        res.status(200).send("Authenticated")
    }
    res.status(402).send("Authorization error")
})

// Socket Events
io.on("connection", (socket) => {
    // Create a room
    socket.on("createRoom", (data) => {
        socket.join(ROOM_ID)
        roomAdmin.socketId = socket.id
    })

    // Join a room
    socket.on("joinRoom", (data) => {
        const { fullname } = data;
        socket.emit("newUserJoined", { fullname })
        socket.join(ROOM_ID)
        let randomNum = Math.floor(Math.random() * 6)
        users.push({
            socketId: socket.id,
            fullname,
            avatar: ['adventurer', 'avataaars', 'bottts', 'croodles', 'micah', 'personas'][randomNum]
        })
    })

    // Leaving a room
    socket.on("disconnect", () => {
        let userLeft;
        users = users.filter(user => {
            if (user.socketId == socket.id) userLeft = user;
            else return true
        })
        socket.emit("userLeft", { fullname: userLeft.fullname })
    })
})

app.listen(3000, () => {
    console.log("Server running at 3000.....")
})