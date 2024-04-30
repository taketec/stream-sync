export function get_global_time(delta = 0){
    let d = new Date()
    let t = d.getTime()/1000
    // delta is the correction parameter
    return t + delta
  }

export function median(values){
    if(values.length === 0){
      return 0
    }
    values.sort((x,y) => (x-y));
    let half = Math.floor(values.length / 2);
    if (values.length % 2){
      return values[half];
    }
    return (values[half - 1] + values[half]) / 2.0;
  }

  export  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export function get_jwt(){
    return localStorage.getItem('userToken');
  }