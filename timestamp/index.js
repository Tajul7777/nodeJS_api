const utcTimestamp = new Date().getTime();

console.log(utcTimestamp); //  16422369....

const copy = new Date();
copy.setTime(utcTimestamp);

console.log(utcTimestamp === copy.getTime()); //  true

const date = new Date();

//returns UTC Hour of the date
console.log(date.getUTCHours()); //  7

//  returns UTC Minutes of the date
console.log(date.getUTCMinutes()); //  10

//  returns UTC Seconds of the date
console.log(date.getUTCSeconds()); //  57

//  returns UTC year of the date
console.log(date.getUTCFullYear()); //  2022

//  returns UTC month (0-11)
//    0 is January, 11 is December
console.log(date.getUTCMonth()); //  0

//  returns UTC day of the month (1-31)
console.log(date.getUTCDate()); //  15