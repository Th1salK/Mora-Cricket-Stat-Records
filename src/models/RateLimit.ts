import { count } from "console"
import {Schema,model,models} from "mongoose"
import { unique } from "next/dist/build/utils"
import { required } from "zod/mini"

const schema = new Schema({
    key:{type:String, required: true, unique:true},
    count:{type:Number, default:0},
    expiresAt:{type:Date,required:true},
})
schema.index({expiresAt:1},{expireAfterSeconds:0})
export default models.RateLimt || model("RateLimit",schema)