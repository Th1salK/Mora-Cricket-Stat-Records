import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from '@/models/Match';

export async function DeleteMatch(
    request:Request,
    {params} : {params:{id:string}}
){
    try{
        await connectDB()
        
        await Match.findByIdAndDelete(params.id)

        return NextResponse.json({success:true})
    
    }catch(error:any)
    {
        return NextResponse.json(
            {error: error.messsage || 'Failed to delete match.'},
            {status :500}
        )
    }
}