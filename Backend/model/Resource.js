const mongoose = require('mongoose');

const resourceSchema =  new mongoose.Schema({
    batchyear: { type:String, required:true },
    description: { type:String, required:true },
    fileUrl: { type:String, required:true },
    uploadedAt: { type:Date, default:Date.now },
});

const ResourceModel = mongoose.model('Resource', resourceSchema);

module.exports = ResourceModel;