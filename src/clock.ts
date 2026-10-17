/** Simulation advances in seconds at 60 Hz, independently of display refresh rate. */
export class FixedClock {
  time=0;
  private accumulator=0;
  advance(elapsedMS:number,step:(seconds:number)=>void){
    this.accumulator+=Math.min(Math.max(elapsedMS/1000,0),.1);
    while(this.accumulator+1e-10>=1/60){
      this.time+=1/60;
      step(1/60);
      this.accumulator-=1/60;
    }
  }
  reset(){this.accumulator=0;}
}
