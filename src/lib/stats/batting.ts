export type BatRow = {runs:number,balls:number,out:boolean}

export function battingSummary(rows:BatRow[]){
    const runs = rows.reduce((s,r)=>s+r.runs,0)
    const balls = rows.reduce((s, r) => s + r.balls, 0)
    const dismissals = rows.filter((r) => r.out).length

     return {
    innings: rows.length,
    runs,
    average: dismissals === 0 ? null : +(runs / dismissals).toFixed(2),
    strikeRate: balls === 0 ? null : +((runs / balls) * 100).toFixed(2),
    highScore: rows.length ? Math.max(...rows.map((r) => r.runs)) : 0,
  }
}
