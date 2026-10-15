import { NextResponse } from 'next/server'

//return match id from the url

export async function GET(
    request: Request,
    {params}:{params:Promise<{id:string}>}
){
    const {id} = await params

    return NextResponse.json({
        matchId:id,
    })
}