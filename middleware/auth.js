const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Paitent = require('../models/Patient')
const Doctor = require('../models/Doctor')

const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization')
        const decoded = jwt.verify(token,process.env.JWT_TOKEN)
        const user = await User.findOne({id:decoded.id,token:token})
        if(!user){
            throw new Error('err')
        }
        req.token = token
        req.user = user
        const paitent = await Paitent.findOne({UserId:req.user.id})
        if(!paitent){
            req.paitent = null
        }
        else{
            req.paitent = paitent
        }
        const doctor = await Doctor.findOne({UserId:req.user.id})
        if(!doctor){
            req.doctor = null
        }
        else{
            req.doctor = doctor
        }
        console.log(req.user,"UUUUUUUUUUUUUUUUUUU")
        console.log(req.doctor,"DDDDDDDDDDDDDDDDDD")
        console.log(req.paitent,"PPPPPPPPPPPPPPPPPPP")
        next()
    }
    catch(e){
        res.status(401).send({error:'please authenticate'})
    }
    
}
module.exports = auth