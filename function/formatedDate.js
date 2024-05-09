const currentDate = new Date();
const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
const istDate = new Date(currentDate.getTime() + istOffset);
const year = istDate.getFullYear();
const month = ("0" + (istDate.getMonth() + 1)).slice(-2);
const day = ("0" + istDate.getDate()).slice(-2);
const hours = ("0" + istDate.getHours()).slice(-2);
const minutes = ("0" + istDate.getMinutes()).slice(-2);
const seconds = ("0" + istDate.getSeconds()).slice(-2);
const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

module.exports = formattedDate