import {describe,it,expect} from 'vitest'
import { battingSummary } from './batting'

describe('batiingSummary',()=>{
    it('ignores not outs when calculatinf the average',()=>{
            const s = battingSummary([
      { runs: 50, balls: 60, out: true },
      { runs: 30, balls: 20, out: false },
    ])
    expect(s.runs).toBe(80)
    expect(s.average).toBe(80)
    expect(s.strikeRate).toBe(100)
    expect(s.highScore).toBe(50)
    })
   
  it('has no average when never dismissed', () => {
    expect(battingSummary([{ runs: 10, balls: 8, out: false }]).average).toBeNull()
  }) 
})