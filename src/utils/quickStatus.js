import {initialWatchDate,localDateKey} from './dates.js';
export function withViewingStatus(movie,status,today=localDateKey(new Date())){
 if(!['watched','watching','plan_to_watch','dropped'].includes(status))throw new Error('Unknown viewing status');
 return {...movie,status,...(status==='watched'?{watch_date:initialWatchDate(movie,today)}:{})};
}
