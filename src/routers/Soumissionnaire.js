const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Soumissionnaire = require('../models/Soumissionnaire')
const multer = require('multer')
//const {sendCode} = require('../emails/forgotPassword')
const bcrypt = require('bcryptjs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdir('./uploads/',(err)=>{
        cb(null, './uploads/')
        })
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    },
})

const fileFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)/)) {
        return cb(new Error('File must be in pdf format!'))
    }

    cb(undefined, true)
}

const upload = multer({storage: storage, fileFilter: fileFilter})

router.post('/soumissionnaires', async (req, res) => {
    const soumissionnaire = new Soumissionnaire({
        ...req.body
    })

    try {
        await soumissionnaire.save()
        const token = await soumissionnaire.generateAuthToken()
        res.status(201).send({soumissionnaire, token})
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/soumissionnaires/login', async (req, res) => {
    try {
        const soumissionnaire = await Soumissionnaire.findByCredentials(req.body.email, req.body.password)
        const token = await soumissionnaire.generateAuthToken()
        res.send({soumissionnaire, token})
    } catch (e) {
        res.status(400).send()
    }
})


router.post('/soumissionnaires/logout', auth(Soumissionnaire), async (req, res) => {
    try {
        req.soumissionnaire.tokens = req.soumissionnaire.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.soumissionnaire.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Update password
router.patch('/soumissionnaires/password/:id', auth(Soumissionnaire), async (req, res) => {
    const _id = req.params.id
    try {
        const soumissionnaire = await Soumissionnaire.findOne({_id})

        if (!soumissionnaire) {
            return res.status(404).send()
        }
        
        const isMatch = await bcrypt.compare(req.body.password, soumissionnaire.password)
        //console.log(isMatch)
        if (!isMatch) {
            throw new Error ('Incorrect password!')
        }
        
        soumissionnaire.password = req.body.newPassword
        await soumissionnaire.save()

        res.send(soumissionnaire)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/soumissionnaires/modify/:id', auth(Soumissionnaire), async(req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['lastname', 'firstname', 'email']
    const isValidOperation =updates.every((update) => allowedUpdates.includes(update))
    

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const soumissionnaire = await Soumissionnaire.findOne({_id})
        updates.forEach((update) => soumissionnaire[update] = req.body[update])
        await soumissionnaire.save()

        res.send(soumissionnaire)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/soumissionnaires/me/image', auth(Soumissionnaire), upload.single('image'), async (req, res) => {
    const file = req.file
    
    const filePath = file.patch

    if(!filePath) {
        return res.status(400).send()
    }

    req.soumissionnaire.image = filePath
    await req.soumissionnaire.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/soumissionnaires/image/:id', async (req, res) => {
    try {
        const soumissionnaire = await Soumissionnaire.findById(req.params.id)
        
        if(!soumissionnaire || !soumissionnaire.image) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(soumissionnaire.image)
    } catch (e) {
        res.status(404).send()
    }
})

router.delete('/soumissionnaires/me/image', auth(Soumissionnaire), async (req, res) => {
    try {
        req.soumissionnaire.image = undefined
        await req.soumissionnaire.save()
        res.send(req.soumissionnaire)
    } catch (e) {
        res.status(404).send()
    }
})


router.delete('/soumissionnaires/:id', auth(Soumissionnaire), async(req, res) => {
    const _id = req.params.id
    try {
        const soumissionnaire = await Soumissionnaire.findOneAndDelete({_id})
        if (!soumissionnaire) {
            return res.status(404).send()
        }
        res.send(soumissionnaire)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/soumissionnaires/forgotPassword/:email', async(req,res) => {
    const code = Math.floor(Math.random()*(1000000-100000)+100000)  
    try {
        const soumissionnaire = await Soumissionnaire.findOne({ email: req.params.email})
        soumissionnaire.code = code
        await soumissionnaire.save()
        //sendCode(soumissionnaire.email,code)
        res.send(soumissionnaire)
    } catch (e) {
        res.status(400).send()
    }

})

router.patch('/soumissionnaires/verification/:email', async(req,res) => {
    try {
        const soumissionnaire = await Soumissionnaire.findOne({email: req.params.email})
        if(soumissionnaire.code !== req.body.code){
            res.send('not correct')
        }
        soumissionnaire.password = req.body.password
        await soumissionnaire.save()
        res.send(soumissionnaire)
        
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/soumissionnaires/:id', async (req, res) => {
    try {
        const soumissionnaire = await Soumissionnaire.findById(req.params.id)
        
        if(!soumissionnaire) {
            throw new Error()
        }
        res.send(soumissionnaire)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/soumissionnaires/search/:lastname', async (req, res) => {
    const lastname = req.params.lastname
    try {
        const soumissionnaires = await Soumissionnaire.find({lastname})
        if (!soumissionnaires) {
            return res.status(404).send()
        }
        res.send(soumissionnaires)
    }catch (e) {
        res.status(500).send()
    }
})

router.get('/soumissionnaires', async (req, res) => {
    try {
        const soumissionnaires = await Soumissionnaire.find({})
        if(!soumissionnaires) {
            throw new Error()
        }
        res.send(soumissionnaires)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router