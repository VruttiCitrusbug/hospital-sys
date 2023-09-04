const express = require('express')
const app = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')
const MedicalRecord = require('../models/medicalrecord')
const jwt = require('jsonwebtoken')
const sendwelcome = require('../emails/account')
const { Error, where } = require('sequelize')
const bcrypt = require('bcrypt');
const sequelize = require('sequelize')
const { response } = require('express')


//Login any user
app.post('/user/login',async (req, res) => {
    const user = await User.findOne({ where: { username: req.body.username }});
    try{
        if(!user){
            throw new Error()
        }
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            user.token = await jwt.sign({id:user.id},process.env.JWT_TOKEN, {expiresIn:'7 days'})
            const get_user = await user.save()

            res.send({
                id:get_user.id,
                username:get_user.username,
                token:get_user.token,
                role:get_user.role
            })
        } 

        else {
           throw new Error("error")
        }
    }catch(e){
        res.status(403).send({error:"invalid data",user:user})
    }
})

//get my data
app.get('/user/me',auth,async (req,res)=>{
    try {
        if(req.doctor != null){
            const medicalrecords = await MedicalRecord.findAll({
                include: [
                  {
                    model: Doctor,
                    include: [
                      {
                        model: User,
                        attributes: ['firstName', 'lastName'],
                      },
                    ],
                    attributes: ['specialization', 'contactNumber'],
                  },
                  {
                    model: Patient,
                    include: [
                      {
                        model: User,
                        attributes: ['firstName', 'lastName'],
                      },
                    ],
                    attributes: ['dateOfBirth', 'gender', 'contactNumber', 'address'],
                  }
                ],
                attributes: ['record_date', 'description'],
                where:{
                    DoctorId:req.doctor.id
                }
            });
            res.send({
                doctor_detail:medicalrecords
            })
        }
        if(req.paitent != null){
            const medicalrecords = await MedicalRecord.findAll({
                include: [
                  {
                    model: Patient,
                    include: [
                      {
                        model: User,
                        attributes: ['firstName', 'lastName'],
                      },
                    ],
                    attributes: ['dateOfBirth', 'gender', 'contactNumber', 'address'],
                  },
                  {
                    model: Doctor,
                    include: [
                      {
                        model: User,
                        attributes: ['firstName', 'lastName'],
                      },
                    ],
                    attributes: ['specialization', 'contactNumber'],
                  },
                ],
                attributes: ['record_date', 'description'],
                where:{
                    PatientId:req.paitent.id
                }
              });
            res.send({
                patient_details:medicalrecords
            })
        }
        if(req.user.role == "staff"){
            res.send({
                firstName:req.user.firstName,
                lastName:req.user.lastName,
                email:req.user.email,
                role:req.user.role
            })
        } 
    }
    catch(e){
        res.status(500).send(e)
    }
})

//get all patient
app.get('/user/patient', auth, async (req, res) => {
    try {
        if (req.user.role == "staff") {

            const patients = await Patient.findAll({
                include: [{model: User,attributes: ['email', 'username', 'firstName', 'lastName'],},],
                attributes: ['id', 'dateOfBirth', 'gender', 'contactNumber', 'address'],
            });

            res.send({
                all_patients: patients,
            });
        } 
        else {
            throw Error();
        }
    } catch (e) {
        res.status(500).send({ error: "not authenticated" });
    }
});

//get all doctors
app.get('/user/doctor', auth, async (req, res) => {
    try {
        if (req.user.role == "staff") {

            const doctors = await Doctor.findAll({
                include: [{ model: User, attributes: ['email', 'username','firstName','lastName'] }],
                attributes: ['id', 'specialization', 'contactNumber'],
              });
            res.send({
                doctors: doctors,
            });
        } 
        else {  
            throw Error();
        }
    } catch (e) {
        res.status(500).send({ error: "not authenticate" });
    }
});

//get all medical record
app.get('/user/medicaldata', auth, async (req, res) => {
    try {
        if (req.user.role == "staff") {

            const medicaldata = await MedicalRecord.findAll({
                include: [
                  {
                    model: Patient,
                    include: [
                      {
                        model: User,
                        attributes: ['firstName', 'lastName'],
                      },
                    ],
                    attributes: ['dateOfBirth', 'gender', 'contactNumber', 'address'],
                  },
                  {
                    model: Doctor,
                    include: [
                      {
                        model: User,
                        attributes: ['firstName', 'lastName'],
                      },
                    ],
                    attributes: ['specialization', 'contactNumber'],
                  },
                ],
                attributes: ['record_date', 'description'],
              });
            res.send({
                medicalrecord: medicaldata,
            });
        } 
        else {  
            throw Error();
        }
    } catch (e) {
        res.status(500).send({ error: "not authenticate" });
    }
});

//update paitent
app.patch('/paitent/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowupdates_user = ['firstName','email','lastName']
    const allowupdates_paitent = ['dateOfBirth','gender','contactNumber','address']
    const allowupdates_medical = ['record_date','Doctor','description']
    const isvalid = await allowupdates_user.concat(allowupdates_paitent).concat(allowupdates_medical).every((update)=>{
        return allowupdates_user.concat(allowupdates_paitent).concat(allowupdates_medical).includes(update)
    })
    if(!isvalid){
        return res.status(400).send({"error":"invalid update"})
    }
    try {
        if(req.user.role != "staff"){
            return res.status(400).send({error:"not staff user"})
        }
        const paitent = await Patient.findOne({ where: { id: req.params.id }});
        const medicaldata = await MedicalRecord.findOne({ where: { PatientId: req.params.id }});

        if(paitent ==  null || medicaldata == null){
            return res.status(400).send({"error":"not any record"})
        }

        const user = await User.findOne({ where: {id:paitent.UserId}})

        updates.forEach((update)=>{
            if(allowupdates_user.includes(update)){
                user[update] = req.body[update]
            }
            if(allowupdates_paitent.includes(update)){
                paitent[update] = req.body[update]
            }
            if(allowupdates_medical.includes(update)){
                medicaldata[update] = req.body[update]
            }
        })
        if(req.body.Doctor){
            updates.splice(updates.indexOf('Doctor'), 1);
            const get_doctor_user = await User.findOne({ where: { username: req.body.Doctor }})
            const doc = await Doctor.findOne({where:{UserId:get_doctor_user.id}})
            if(!doc){
                return res.status(400).send({error:"doctor not exist"})
            }
            else{
                medicaldata['DoctorId'] = doc.id
            }
        }
        await paitent.save()
        await user.save()
        await medicaldata.save()

        const medicalrecord = await MedicalRecord.findAll({
            include: [
              {
                model: Patient,
                include: [
                  {
                    model: User,
                    attributes: ['firstName', 'lastName'],
                  },
                ],
                attributes: ['dateOfBirth', 'gender', 'contactNumber', 'address'],
              },
              {
                model: Doctor,
                include: [
                  {
                    model: User,
                    attributes: ['firstName', 'lastName'],
                  },
                ],
                attributes: ['specialization', 'contactNumber'],
              },
            ],
            attributes: ['record_date', 'description'],
            where:{PatientId:req.params.id}
          });
        res.send({
            medicalrecord: medicalrecord,
        });
    }
    catch(e){
        res.status(500).send({error:e})
    }
})

//update doctor
app.patch('/doctor/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowupdates_user = ['firstName','email','lastName']
    // const allowupdates_paitent = ['dateOfBirth','gender','contactNumber','address']
    const allowupdates_doctor = ['specialization','contactNumber']
    const isvalid = await allowupdates_user.concat(allowupdates_doctor).every((update)=>{
        return allowupdates_user.concat(allowupdates_doctor).includes(update)
    })
    if(!isvalid){
        return res.status(400).send({"error":"invalid update"})
    }
    try {
        if(req.user.role != "staff"){
            return res.status(400).send()
        }
        const doctor = await Doctor.findOne({ where: { id: req.params.id }});
        const user = await User.findOne({ where: {id:doctor.UserId}});

        updates.forEach((update)=>{
            if(allowupdates_user.includes(update)){
                doctor[update] = req.body[update]
            }
            if((allowupdates_doctor).includes(update)){
                doctor[update] = req.body[update]
            }
        })
        await doctor.save()
        await user.save()
        res.send({
            firstName:user.firstName,
            lastName:user.lastName,
            email:user.email,
            specialization:doctor.specialization,
            contactNumber:doctor.contactNumber
        })
    }
    catch(e){
        res.status(500).send({error:e})
    }
})

//delete patitent
app.delete('/paitent/:id',auth,async (req,res)=>{
    try {
        const getpaitent = await Patient.findOne({where:{id:req.params.id}})
        if(req.user.role != "staff"|| getpaitent == null){
            return res.status(403).send({error:"unauthorised"})
        }
        await Patient.destroy({where: {id:req.params.id}})
        await User.destroy({where: {id:getpaitent.UserId}})
        await MedicalRecord.destroy({where: {PatientId:getpaitent.id}})

        res.send({success:"user deleted successfully."})
    }
    catch(e){
        res.status(500).send(e)
    }
})

//delete doctor
app.delete('/doctor/:id',auth,async (req,res)=>{
    try {
        const getdoctor = await Doctor.findOne({where:{id:req.params.id}})
        if(req.user.role != "staff"|| getdoctor == null){
            res.status(403).send({error:"unauthorised"})
        }
        await Doctor.destroy({where: {id:req.params.id}})
        await User.destroy({where: {id:getdoctor.UserId}})
        await MedicalRecord.destroy({where: {DoctorId:getdoctor.id}})

        res.send({success:"user deleted successfully."})
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = app