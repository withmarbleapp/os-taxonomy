// Spatial variety is bounded so arithmetic does not become the main difficulty.
export const shapeKey=dims=>[...dims].sort((a,b)=>a-b).join(',');
export const practiceShapes=[[3,2,1],[3,2,2],[3,2,3],[3,3,3]].map(shapeKey);
export function makeTaskPools(){
 const pools=[[],[],[]];const seen=[new Set(),new Set(),new Set()];
 const add=(stage,dims)=>{const key=shapeKey(dims);if(!seen[stage].has(key)&&!practiceShapes.includes(key)){seen[stage].add(key);pools[stage].push(dims);}};
 for(let w=2;w<=5;w++)for(let d=1;d<=3;d++)for(let h=1;h<=3;h++){
  const total=w*d*h;if(total>=8&&total<=30&&[w,d,h].filter(n=>n>1).length>=2)add(0,[w,d,h]);
 }
 for(let w=3;w<=5;w++)for(let d=3;d<=5;d++)for(let h=3;h<=4;h++)if(w*d*h<=80)add(1,[w,d,h]);
 for(let w=6;w<=8;w++)for(let d=1;d<=3;d++)for(let h=2;h<=4;h++)if(w*d*h<=72)add(2,[w,d,h]);
 return pools;
}
export const taskPools=makeTaskPools();
export function chooseTask(stage,used,first=false,random=Math.random){
 if(first&&!used.includes(shapeKey([2,2,2])))return [2,2,2];
 const pool=taskPools[stage].filter(d=>!used.includes(shapeKey(d)));
 return pool.length?[...pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]]:null;
}
export function scorePlan(dims,plan){const [w,d,h]=dims;return plan.perLayer===w*d&&plan.layers===h&&plan.total===w*d*h;}
export function advances(response){return response.correct&&!response.assisted;}
