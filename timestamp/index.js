const utcTimestamp = new Date().getTime();

console.log(utcTimestamp); // 👉️ 16422369....

const copy = new Date();
copy.setTime(utcTimestamp);

console.log(utcTimestamp === copy.getTime()); // 👉️ true