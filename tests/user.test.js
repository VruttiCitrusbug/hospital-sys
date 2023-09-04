const request = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Doctor = require('../models/Doctor')
const Paitent = require('../models/Patient')
const jwt = require('jsonwebtoken')
const MedicalRecord = require('../models/medicalrecord')
const bcrypt = require('bcrypt')
const stafftoken=jwt.sign({id:1},process.env.JWT_TOKEN); 
const doctoken=jwt.sign({id:2},process.env.JWT_TOKEN); 


const paitent2 = {
    "email": "vrutti.citrusbug@gmail.com",
    "username": "vrutti123",
    "password": "vrutti123",
    "firstName": "vrutti",
    "lastName": "patel",
    "dateOfBirth": "12-28-2001",
    "gender": "female",
    "contactNumber": "9328589232",
    "address": "ghodasar,abad",
    "record_date":"2023-09-02",
    "description":"description1",
    "doctor":"parth123"
}

beforeAll(async ()=>{
    await User.destroy({
        where:{}
      });
    await Paitent.destroy({
    where:{}
    });
    await Doctor.destroy({
        where:{}
        });
    await MedicalRecord.destroy({
        where:{}
        });
    
        const user_staff1 ={
            "id":1,
            "email": "ravi.citrusbug@gmail.com",
            "username":"ravi123",
            "password":await bcrypt.hash("ravi123", 10),
            "firstName":"ravi",
            "lastName":"patel",
            "role":"staff",
            "token":stafftoken
        }
        
        const user_patient1 ={
            "email": "dhiren.citrusbug@gmail.com",
            "username": "dhiren123",
            "password": await bcrypt.hash("dhiren123", 10),
            "firstName": "dhiren",
            "lastName": "parmar",
            "role":"patient",
        }
        
        const user_doctor1 ={
            "email": "parth.citrusbug@gmail.com",
            "username": "parth123",
            "password": await bcrypt.hash("parth123", 10),
            "firstName": "parth",
            "lastName": "machi",
            "role":"doctor",
            "token":doctoken
        }
        
        
        const doctor1 = {
            "specialization": "bone",
            "gender": "male",
            "contactNumber": "1234567890",
            "address": "vasna,abad",
        }
        
        const paitent1 = {
            "dateOfBirth": "08-12-1999",
            "gender": "male",
            "contactNumber": "1234567890",
            "address": "vasna,abad",
        }

        const medical = {
            "record_date":"2023-09-02",
            "description":"description1",
        }

    await new User(user_staff1).save()
    const did = await new User(user_doctor1).save()
    const pid = await new User(user_patient1).save()
    paitent1.UserId=pid.id
    const pat = await new Paitent(paitent1).save()
    doctor1.UserId=did.id
    const doc = await new Doctor(doctor1).save()
    medical.PaitentId = pat.id
    medical.DoctorId = doc.id
    await new MedicalRecord(medical).save()
})

// afterAll(async ()=>{
//     await User.destroy({
//         where:{}
//       });
//     await Paitent.destroy({
//     where:{}
//     });
//     await MedicalRecord.destroy({
//         where:{}
//         });
// })

test('should create patient with staff token',async ()=>{
    res = await request(app)
    .post("/paitent")
    .set('Authorization',`${stafftoken}`)
    .send(paitent2).expect(201)
})

test('should login valid user',async () => {
    await request(app).post("/user/login").send({
        "username": "vrutti123",
        "password": "vrutti123"
    }).expect(200)
})

test('should not login without valid user',async () => {
    await request(app).post("/user/login").send({
        "username": "priti123",
        "password": "vrutti123"
    }).expect(403)
})

test("should create patient with doctor's token",async ()=>{
    res_doc = await request(app).post("/user/login").send({
        "username": "parth123",
        "password": "parth123"
    }).expect(200)
    res = await request(app)
    .post("/paitent")
    .set('Authorization',`${res_doc.token}`)
    .send(paitent2).expect(401)
})

test("should get data of authorised user",async () =>{
    res_doc = await request(app).post("/user/login").send({
        "username": "parth123",
        "password": "parth123"
    }).expect(200)
    res = await request(app)
    .get("/user/me")
    .set('Authorization',`${res_doc.body.token}`)
    .expect(200)
})

test("should get data of doctor by staff user",async () =>{
    res = await request(app)
    .get("/user/doctor")
    .set('Authorization',`${stafftoken}`)
    .expect(200)
})

test("should not get data of doctor by staff user",async () =>{
    res_doc = await request(app).post("/user/login").send({
        "username": "parth123",
        "password": "parth123"
    }).expect(200)
    res = await request(app)
    .get("/user/doctor")
    .set('Authorization',`${res_doc.body.token}`)
    .expect(500)
})


test("should update data of patient by staff user",async () =>{
    const paitent = await request(app).post("/user/login").send({
        "username": "dhiren123",
        "password": "dhiren123"
    }).expect(200)
    getp = await Paitent.findOne({where:{UserId:paitent.body.id}})

    res = await request(app)
    .patch(`/patient/${getp.id + 1}`)
    .set('Authorization',`${paitent.body.token}`)
    .send({
        "firstName":"vrutti"
    })
    .expect(403)
})

test("should update data of patient by staff user",async () =>{
    const paitent = await request(app).post("/user/login").send({
        "username": "dhiren123",
        "password": "dhiren123"
    }).expect(200)
    getp = await Paitent.findOne({where:{UserId:paitent.body.id}})
    res = await request(app)
    .patch(`/paitent/${getp.id}`)
    .set('Authorization',`${stafftoken}`)
    .send({
        "firstName":"vrutti"
    })
    .expect(200)
})

test("should update data of doctor by staff user",async () =>{
    const doctor = await request(app).post("/user/login").send({
        "username": "parth123",
        "password": "parth123"
    }).expect(200)
    getd = await Doctor.findOne({where:{UserId:doctor.body.id}})

    res = await request(app)
    .patch(`/patient/${getd.id + 1}`)
    .set('Authorization',`${Doctor.body.token}`)
    .send({
        "firstName":"vrutti"
    })
    .expect(403)
})

test("should update data of doctor by staff user",async () =>{
    const paitent = await request(app).post("/user/login").send({
        "username": "parth123",
        "password": "parth123"
    }).expect(200)
    getp = await Paitent.findOne({where:{UserId:paitent.body.id}})
    res = await request(app)
    .patch(`/paitent/${getp.id}`)
    .set('Authorization',`${stafftoken}`)
    .send({
        "firstName":"vrutti"
    })
    .expect(200)
})

test("should not delete data of patient user",async () =>{
    const paitent = await request(app).post("/user/login").send({
        "username": "dhiren123",
        "password": "dhiren123"
    }).expect(200)
    
    getp = await Paitent.findOne({where:{UserId:paitent.body.id}})

    await request(app)
    .delete(`/paitent/${getp.id}`)
    .set('Authorization',`${paitent.body.token}`)
    .expect(403)
})

test("should delete data of patient by staff user",async () =>{
    const paitent = await request(app).post("/user/login").send({
        "username": "dhiren123",
        "password": "dhiren123"
    }).expect(200)
    getp = await Paitent.findOne({where:{UserId:paitent.body.id}})
    res = await request(app)
    .delete(`/paitent/${getp.id}`)
    .set('Authorization',`${stafftoken}`)
    .expect(200)
})