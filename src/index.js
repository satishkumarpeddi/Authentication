const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const { json } = require('zod')
require('dotenv').config({
    path:path.resolve(__dirname,'../.env')
})
const app = express(); // recreating a app instance's
app.use(express.json()) // it is middleware that is used to get access to req.body 

const users = []; // In-memory 
const JWT_SECRET = process.env.JWT_SECRET;
// const generateToken = () => {
//     const options = ['a','b','c','d','e','f','g','h','i','j','k',
//         'l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
//         'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
//         'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5',
//         '6','7','8','9'
//     ]
//     let token = ""
//     for(let i=0;i<32;i++)
//         token+=options[(Math.floor(Math.random()*options.length))]
//     return token;
// }
app.post('/signup',async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    users.push({
        username:username,
        password:await bcrypt.hash(password,10)
    })
    res.json({
        msg:"You are signed up successfully"
    })

    console.log(users)
})

app.post('/signin',async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    let foundUser = (users.find((user)=>{ return user.username == username}))
    if(!foundUser) return;
    
    const isValid = await bcrypt.compare(password,foundUser.password);
    if(isValid){
        const token = jwt.sign({username:username},JWT_SECRET);
        res.json({
            token:token
        })
    }else{
        res.status(403).json({
            msg:"Invalid username or password"
        })
    }
    console.log(users)
})

app.get('/me',async (req,res)=>{
    const token = req.headers.authorization;
    let isValid = jwt.verify(token,JWT_SECRET)
    if(!isValid){
        return res.status(403).json({
            msg:"Authorization token is required or UnAuthorized Access"
        }) 
    }
    let user_name = isValid.username;
    let user = users.find((user)=>{
        return user.username == user_name;
    })
    res.status(200).json({
        username:isValid.username,
        password:user.password,
    })
})

app.listen(3000,()=>{
    console.log(`Server is running on the port : 3000`)
})