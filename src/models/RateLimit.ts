import {Schema,model,models} from "mongoose"

const schema = new Schema({
    key:{type:String, required: true, unique:true},
    count:{type:Number, default:0},
    expiresAt:{type:Date,required:true},
})
schema.index({expiresAt:1},{expireAfterSeconds:0})
export default models.RateLimit || model("RateLimit",schema)