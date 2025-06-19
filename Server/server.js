import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

// APIs


app.listen(3000, ()=>{
    console.log("Server running at 3000.....")
})