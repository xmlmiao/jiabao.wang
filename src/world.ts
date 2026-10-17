export const WIDTH=192;
export const HEIGHT=128;
export const CAT_WIDTH=24;
export const CAT_HEIGHT=20;
export const BOX={x:153,y:106,w:25,h:14,catX:153,foot:117,rim:112} as const;
export type Phase='day'|'dusk'|'night';
export function getPhase(search:URLSearchParams,date=new Date()):Phase{
  const forced=search.get('phase');
  if(forced==='day'||forced==='dusk'||forced==='night')return forced;
  const hour=date.getHours();
  return hour>=6&&hour<17?'day':hour>=17&&hour<19?'dusk':'night';
}
