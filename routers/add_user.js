const express = require('express')
const app = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')
const MedicalRecord = require('../models/medicalrecord')
const jwt = require('jsonwebtoken')
const sendwelcome = require('../emails/account')
const { Error } = require('sequelize')
const bcrypt = require('bcrypt');


//Create staff member
app.post('/staff',async (req, res) => {
    try{
        data = req.body
        const user = new User({
            "email": data.email,
            "username":data.username,
            "password":await bcrypt.hash(data.password, 10),
            "firstName":data.firstName,
            "lastName":data.lastName,
            "role":"staff"
        })
        await user.save()
        res.status(201).send({success:"user created"})

    }catch(error){
        res.status(400).send({error:error})
    }
})

app.post('/doctor',auth,async (req, res) => {

    if(req.user.role != "staff"){
        return res.status(400).send()
    }
    data = req.body
    get_user_object = {
        email: data.email,
        username:data.username,
        password:await bcrypt.hash(data.password, 10),
        firstName:data.firstName,
        lastName:data.lastName,
        role:"doctor"
    }
    const user = new User(get_user_object)
    try{
        const get_user = await user.save()
        get_doctor_object = {
            specialization:data.specialization,
            contactNumber:data.contactNumber,
            UserId:get_user.id
        }
        await Doctor.create(get_doctor_object);
        // sendwelcome(get_user.email)
        res.status(201).send({success:"user created"})

    }catch(error){
        res.status(400).send({error:error})
    }
})

app.post('/paitent',auth,async (req, res) => {
    if(req.user.role != "staff"){
        return res.status(404).send({error:"not authenticate"})
    }
    data = req.body
    get_user_object = {
        "email": data.email,
        "username":data.username,
        "password":await bcrypt.hash(data.password, 10),
        "firstName":data.firstName,
        "lastName":data.lastName,
        "role":"patient"
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
        const get_patient = await patient.save()
        const get_doctor_user = await User.findOne({ where: { username: data.doctor }})
        // sendwelcome(get_user.email)
        if(get_doctor_user == null){
            await User.destroy({where: {id:get_user.id}})
            await Patient.destroy({where: {id:get_patient.id}})
            res.status(400).send("No such Doctor exist!")
        }
        const get_doctor = await Doctor.findOne({ where: { UserId: get_doctor_user.id }})
        get_medicalrecord = {
            "record_date":data.record_date,
            "description":data.description,
            "PatientId":get_patient.id,
            "DoctorId":get_doctor.id
        }
        const medicalrecord = new MedicalRecord(get_medicalrecord)
        await medicalrecord.save()
        res.status(201).send({success:"user created"})

    }catch(error){
        res.status(400).send({error:"error"})
    }
})

module.exports = app