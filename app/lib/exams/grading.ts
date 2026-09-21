export function gradeExam(results:boolean[]){const score=results.filter(Boolean).length;return{score,total:results.length,passed:results.length===20&&score===20}}
