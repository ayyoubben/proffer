const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Evaluateur = require('../models/Evaluateur')
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

router.post('/evaluateurs', async (req, res) => {
    const evaluateur = new Evaluateur({
        ...req.body
    })

    try {
        await evaluateur.save()
        const token = await evaluateur.generateAuthToken()
        res.status(201).send({evaluateur, token})
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/evaluateurs/login', async (req, res) => {
    try {
        const evaluateur = await Evaluateur.findByCredentials(req.body.email, req.body.password)
        const token = await evaluateur.generateAuthToken()
        res.send({evaluateur, token})
    } catch (e) {
        res.status(400).send()
    }
})


router.post('/evaluateurs/logout', auth(Evaluateur), async (req, res) => {
    try {
        req.evaluateur.tokens = req.evaluateur.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.evaluateur.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Update password
router.patch('/evaluateurs/password/:id', auth(Evaluateur), async (req, res) => {
    const _id = req.params.id
    try {
        const evaluateur = await Evaluateur.findOne({_id})

        if (!evaluateur) {
            return res.status(404).send()
        }
        
        const isMatch = await bcrypt.compare(req.body.password, evaluateur.password)
        //console.log(isMatch)
        if (!isMatch) {
            throw new Error ('Incorrect password!')
        }
        
        evaluateur.password = req.body.newPassword
        await evaluateur.save()

        res.send(evaluateur)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/evaluateurs/modify/:id', auth(Evaluateur), async(req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['lastname', 'firstname', 'email']
    const isValidOperation =updates.every((update) => allowedUpdates.includes(update))
    

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const evaluateur = await Evaluateur.findOne({_id})
        updates.forEach((update) => evaluateur[update] = req.body[update])
        await evaluateur.save()

        res.send(evaluateur)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/evaluateurs/me/image', auth(Evaluateur), upload.single('image'), async (req, res) => {
    const file = req.file
    
    const filePath = file.patch

    if(!filePath) {
        return res.status(400).send()
    }

    req.evaluateur.image = filePath
    await req.evaluateur.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/evaluateurs/image/:id', async (req, res) => {
    try {
        const evaluateur = await Evaluateur.findById(req.params.id)
        
        if(!evaluateur || !evaluateur.image) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(evaluateur.image)
    } catch (e) {
        res.status(404).send()
    }
})

router.delete('/evaluateurs/me/image', auth(Evaluateur), async (req, res) => {
    try {
        req.evaluateur.image = undefined
        await req.evaluateur.save()
        res.send(req.evaluateur)
    } catch (e) {
        res.status(404).send()
    }
})


router.delete('/evaluateurs/:id', auth(Evaluateur), async(req, res) => {
    const _id = req.params.id
    try {
        const evaluateur = await Evaluateur.findOneAndDelete({_id})
        if (!evaluateur) {
            return res.status(404).send()
        }
        res.send(evaluateur)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/evaluateurs/forgotPassword/:email', async(req,res) => {
    const code = Math.floor(Math.random()*(1000000-100000)+100000)  
    try {
        const evaluateur = await Evaluateur.findOne({ email: req.params.email})
        evaluateur.code = code
        await evaluateur.save()
        //sendCode(evaluateur.email,code)
        res.send(evaluateur)
    } catch (e) {
        res.status(400).send()
    }

})

router.patch('/evaluateurs/verification/:email', async(req,res) => {
    try {
        const evaluateur = await Evaluateur.findOne({email: req.params.email})
        if(evaluateur.code !== req.body.code){
            res.send('not correct')
        }
        evaluateur.password = req.body.password
        await evaluateur.save()
        res.send(evaluateur)
        
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/evaluateurs/:id', async (req, res) => {
    try {
        const evaluateur = await Evaluateur.findById(req.params.id)
        
        if(!evaluateur) {
            throw new Error()
        }
        res.send(evaluateur)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/evaluateurs/search/:lastname', async (req, res) => {
    const lastname = req.params.lastname
    try {
        const evaluateurs = await Evaluateur.find({lastname})
        if (!evaluateurs) {
            return res.status(404).send()
        }
        res.send(evaluateurs)
    }catch (e) {
        res.status(500).send()
    }
})

router.get('/evaluateurs', async (req, res) => {
    try {
        const evaluateurs = await Evaluateur.find({})
        if(!evaluateurs) {
            throw new Error()
        }
        res.send(evaluateurs)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router