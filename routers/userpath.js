const express = require('express')
const app = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')
const jwt = require('jsonwebtoken')
const sendwelcome = require('../emails/account')
const { Error } = require('sequelize')
const bcrypt = require('bcrypt');


//DONE
app.post('/paitent',async (req, res) => {
    console.log(req.body)
    data = req.body
    get_user_object = {
        "email": data.email,
        "username":data.username,
        "password":await bcrypt.hash(data.password, 10),
        "firstName":data.firstName,
        "lastName":data.lastName,
    }
    const user = new User(get_user_object)
    try{
        const get_user = await user.save()
        console.log(get_user.id)
        get_paitent_object = {
            "dateOfBirth":data.dateOfBirth,
            "gender":data.gender,
            "contactNumber":data.contactNumber,
            "address":data.address,
            "UserId": get_user.id
        }
        const patient = new Patient(get_paitent_object)
        await patient.save()
        // sendwelcome(get_user.email)
        res.status(201).send({success:"user created"})

    }catch(error){
        res.status(400).send({error:error})
    }
})

//DONE
app.post('/doctor',async (req, res) => {
    console.log(req.body)
    data = req.body
    get_user_object = {
        email: data.email,
        username:data.username,
        password:await bcrypt.hash(data.password, 10),
        firstName:data.firstName,
        lastName:data.lastName,
    }
    const user = new User(get_user_object)
    try{
        const get_user = await user.save()
        get_doctor_object = {
            specialization:data.specialization,
            contactNumber:data.contactNumber,
            UserId:get_user.id
        }
        // const doctor = new Doctor(get_doctor_object)
        const doc_obj = await Doctor.create(get_doctor_object);
        
        console.log(doc_obj,"PPPPPPPPPPPPPPPPPPPPP")
        // sendwelcome(get_user.email)
        res.status(201).send({success:"user created"})

    }catch(error){
        res.status(400).send({error:error})
    }
})

//DONE
app.post('/user/login',async (req, res) => {
    try{
        const user = await User.findOne({ username: req.body.username });
        if(!user){
            throw new Error('unable to log in')
        }
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        console.log(req.body.password,"PPPPPPPPPPPPPPPPPPPPPPPPP")
        console.log(user.password,"PPPPPPPPPPPPPPPPPPPPPPPPP")
        
        if (passwordMatch) {
            user.token = await jwt.sign({id:user.id},process.env.JWT_TOKEN, {expiresIn:'7 days'})
            const get_user = await user.save()

            res.send({
                username:get_user.username,
                token:get_user.token
            })
        } else {
           throw Error("error")
        }
    }catch(e){
        res.status(403).send({error:"invalid data"})
    }
})

//DONE
app.get('/user/me',auth,async (req,res)=>{
    try {
        if(req.doctor != null){
            res.send({
                firstName:req.user.firstName,
                lastName:req.user.lastName,
                email:req.user.email,
                specialization:req.doctor.specialization,
                contactNumber:req.doctor.contactNumber
            })
        }
        if(req.paitent != null){
            res.send({
                firstName:req.user.firstName,
                lastName:req.user.lastName,
                email:req.user.email,
                dateOfBirth:req.paitent.dateOfBirth,
                gender:req.paitent.gender,
                contactNumber:req.paitent.contactNumber,
                address:req.paitent.address
            })
        } 
    }
    catch(e){
        res.status(500).send(e)
    }
})

app.get('/user/paitent',auth,async (req,res)=>{
    try {
        if(req.doctor!= null){
            const paitent = await Patient.findAll({})
            res.send({
                paitents:paitent
            })
        }
        else{
            throw Error("please authenticate by doctor's token")
        }
    }
    catch(e){
        res.status(500).send(e)
    }
})

app.patch('/paitent/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowupdates_user = ['firstName','email','lastName']
    const allowupdates_paitent = ['dateOfBirth','gender','contactNumber','address']
    // const allowupdates_doctor = ['specialization','contactNumber']
    const isvalid = await allowupdates_user.concat(allowupdates_paitent).every((update)=>{
        return allowupdates_user.concat(allowupdates_paitent).includes(update)
    })
    if(!isvalid){
        return res.status(400).send({"error":"invalid update"})
    }
    try {
        
        if(!req.user){
            return res.status(400).send()
        }
        const paitent = await Patient.findOne({id:req.params.id})
        if(req.paitent.id == req.params.id || req.doctor != null){
            const user = await Patient.findOne({id:paitent.User})
            updates.forEach((update)=>{
                if(allowupdates_user.includes(update)){
                    user[update] = req.body[update]
                }
                if((allowupdates_paitent).includes(update)){
                    paitent[update] = req.body[update]
                }
            })
            await paitent.save()
            await user.save()
            res.send({
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                dateOfBirth:paitent.dateOfBirth,
                gender:paitent.gender,
                contactNumber:paitent.contactNumber,
                address:paitent.address
            })
        }
        else{
            return res.status(400).send({"error":"not authenticated"})
        }
    }
    catch(e){
        res.status(500).send({error:e})
    }
})


// app.post('/users',async (req, res) => {
//     const user = new User(req.body)
//     console.log(user)
//     try{
//         await user.save()
//         // sendwelcome(user.email)
//         res.status(201).send(user)

//     }catch(error){
//         res.status(400).send({error:error})
//     }
// })

// app.post('/user/login',async (req, res) => {
//     try{
//         const user = await User.findByCredentials(req.body.email,req.body.password)
//         const token = await user.generateAuthToken()
//         res.send({user:await user.getPublicProfile(),token})

//     }catch(e){
//         res.status(403).send({error:"invalid data"})
//     }
// })



// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// app.post('/users/logout',auth,async (req,res) => {
    
//     try{
//         req.user.tokens = req.user.tokens.filter((token)=>{
//             return token.token !== req.token
//         })
//         console.log(req.user.tokens)
//         await req.user.save()
//         console.log(req.user)
//         res.send({success:"Successfully loged out"})
//     }catch(e){
//         res.status(400).send(e)
//     }
// })


// app.delete('/users/:id',async (req,res)=>{
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if(!user){
//             res.status(400).send({error:"user not exist."})
//         }
//         res.send({success:"user deleted successfully."})
//     }
//     catch(e){
//         res.status(500).send(e)
//     }
// })


module.exports = app