const mongoose = require('mongoose')

const inscEnrSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: false,
    },
    numRegistre: {
        value: {
            type: String,
            required: false,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    qualification: {
        value: {
            type: String,
            required: false,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    codes: {
        codes: [
            {
                type: String,
                required: false
            }
        ],
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    nif: {
        value: {
            type: String,
            required: false,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    nis: {
        value: {
            type: String,
            required: false,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    casnos: {
        value: {
            type: String,
            required: false,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    cacopath: {
        value: {
            type: String,
            required: false,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    documents: [{
        type: String,
        required: false
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Soumissionnaire'  
    },
},
{
    timestamps: true
})

const InscEnr = mongoose.model('InscEnr', inscEnrSchema)

module.exports = InscEnr