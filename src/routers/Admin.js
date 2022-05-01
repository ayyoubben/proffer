const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Admin = require('../models/Admin')
const multer = require('multer')
//const {sendCode} = require('../emails/forgotPassword')
const bcrypt = require('bcryptjs')

router.post('/admin', async (req, res) => {
    const admin = new Admin({
        ...req.body
    })

    try {
        await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).send({admin, token})
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/admin/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({admin, token})
    } catch (e) {
        res.status(400).send()
    }
})


router.post('/admin/logout', auth(Admin), async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Update password
router.patch('/admin/password/:id', auth(Admin), async (req, res) => {
    const _id = req.params.id
    try {
        const admin = await Admin.findOne({_id})

        if (!admin) {
            return res.status(404).send()
        }
        
        const isMatch = await bcrypt.compare(req.body.password, admin.password)
        if (!isMatch) {
            throw new Error ('Incorrect password!')
        }
        
        admin.password = req.body.newPassword
        await admin.save()

        res.send(admin)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/admin/modify/:id', auth(Admin), async(req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email']
    const isValidOperation =updates.every((update) => allowedUpdates.includes(update))
    

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const admin = await Admin.findOne({_id})
        updates.forEach((update) => admin[update] = req.body[update])
        await admin.save()

        res.send(admin)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/admin/:id', auth(Admin), async(req, res) => {
    const _id = req.params.id
    try {
        const admin = await Admin.findOneAndDelete({_id})
        if (!admin) {
            return res.status(404).send()
        }
        res.send(admin)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/admin/forgotPassword/:email', async(req,res) => {
    const code = Math.floor(Math.random()*(1000000-100000)+100000)  
    try {
        const admin = await Admin.findOne({ email: req.params.email})
        admin.code = code
        await admin.save()
        //sendCode(admin.email,code)
        res.send(admin)
    } catch (e) {
        res.status(400).send()
    }

})

router.patch('/admin/verification/:email', async(req,res) => {
    try {
        const admin = await Admin.findOne({email: req.params.email})
        if(admin.code !== req.body.code){
            res.send('not correct')
        }
        admin.password = req.body.password
        await admin.save()
        res.send(admin)
        
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/admin/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id)
        
        if(!admin) {
            throw new Error()
        }
        res.send(admin)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/admin', async (req, res) => {
    try {
        const admins = await Admin.find({})
        if(!admins) {
            throw new Error()
        }
        res.send(admins)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router