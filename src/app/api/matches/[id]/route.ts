import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from '@/models/Match';

export async function DELETE(
    request:Request,
    context : {params:{id:string}}
){
    try{
        await connectDB()
        
        const {id} = context.params;

        await Match.findByIdAndDelete(id)

        return NextResponse.json({message:'Match Deleted Succesfully'})
    
    }catch(error:any)
    {
        return NextResponse.json(
            {error: error.messsage || 'Failed to delete match.'},
            {status :500}
        )
    }
}