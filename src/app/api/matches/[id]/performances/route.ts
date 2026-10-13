import { NextResponse } from 'next/server'
import { connectDB } from '../../../../../lib/mongodb'
import { requireAdmin } from '../../../../../lib/auth'
import Match from '../../../../../models/Match'
import BattingPerformance from '../../../../../models/BattingPerformance'
import BowlingPerformance from '../../../../../models/BowlingPerformance'

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