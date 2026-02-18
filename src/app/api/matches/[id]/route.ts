import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from '@/models/Match';
import { connect } from "http2";
import { ConnectionPoolReadyEvent } from "mongodb";

export async function DELETE(
    request:Request,
    context : {params:Promise<{id:string}>}
){
    try{
        await connectDB()
        
        const {id} = await context.params;

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

export async function PUT(
    request:NextRequest,
    context:{params: Promise<{id:string}>}
) {
    try{
        await connectDB()
        const {id} = await context.params
        const body = await request.json()

        const updatedMatch = await Match.findByIdAndUpdate(id,body,{
            new:true, runValidators: true
        })

        if(!updatedMatch){
            return NextResponse.json(
                {error:'Match not found'},
                {status : 404}
            )
        }

        return NextResponse.json(updatedMatch)
    }catch(error:any){
        return NextResponse.json(
            {
                error: error.message || 'update failed'
            },
            {status:500}
        )
    }
}