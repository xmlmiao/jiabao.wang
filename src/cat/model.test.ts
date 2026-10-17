import { describe, expect, it } from 'vitest';
import { FixedClock } from '../clock';
import { BOX } from '../world';
import { createCatController, POSES } from './model';

describe('Baxa simulation',()=>{
  it('moves the same distance at 30, 60, 120 and 144 Hz',()=>{
    const positions=[30,60,120,144].map(hz=>{const model=createCatController('right'),clock=new FixedClock();for(let i=0;i<hz*4;i++)clock.advance(1000/hz,model.step);expect(clock.time).toBeCloseTo(4,8);return model.cat.x;});
    expect(Math.max(...positions)-Math.min(...positions)).toBeLessThan(.001);
  });
  it('does not catch up a long background interval',()=>{
    const model=createCatController('right'),clock=new FixedClock(),x=model.cat.x;
    clock.advance(120000,model.step);
    expect(model.cat.x-x).toBeLessThan(2);expect(clock.time).toBeLessThan(.11);
  });
  it('wakes and walks to the fixed box before entering',()=>{
    const model=createCatController();model.cat.x=35;model.enter('sleep',10);model.goHome();
    const states=[model.cat.state];let biggestMove=0;
    for(let i=0;i<1500&&model.cat.state!=='box';i++){const before=model.cat.x;model.step(1/60);biggestMove=Math.max(biggestMove,Math.abs(model.cat.x-before));if(states.at(-1)!==model.cat.state)states.push(model.cat.state);}
    expect(states).toEqual(['lie','crouch','stand','walk','stand','box']);
    expect(model.cat.x).toBe(BOX.catX);expect(model.cat.foot).toBe(BOX.foot);expect(biggestMove).toBeLessThan(.5);
  });
  it('leaves the box before playing',()=>{
    const model=createCatController();model.enter('box',10);model.leaveHome('play');
    for(let i=0;i<600&&model.cat.state!=='play';i++)model.step(1/60);
    expect(model.cat.state).toBe('play');expect(model.cat.x).toBeLessThan(BOX.catX-20);expect(model.cat.foot).toBe(114);
  });
  it('responds to petting in the box without leaving it',()=>{
    const model=createCatController();model.enter('box',10);model.greet();model.step(.2);
    expect(model.cat.state).toBe('box');expect(model.cat.x).toBe(BOX.catX);expect(model.cat.meow).toBeGreaterThan(2);
  });
  it('honors all public pose parameters',()=>{
    for(const pose of POSES){const model=createCatController(pose);for(let i=0;i<120;i++)model.step(1/60);expect(model.cat.state).toBe(pose);if(pose==='box')expect(model.cat.x).toBe(BOX.catX);}
  });
  it('ignores an unknown pose instead of freezing transitions',()=>{
    const a=createCatController('typo',()=>.2),b=createCatController(null,()=>.2);
    for(let i=0;i<600;i++){a.step(1/60);b.step(1/60);}
    expect(a.cat).toEqual(b.cat);
  });
});
