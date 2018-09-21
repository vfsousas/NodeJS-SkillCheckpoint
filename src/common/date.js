function isDate (date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

function greaterThan(date1, date2){
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    return d2.getTime() >= d1.getTime();
}
module.exports = {
    isDate: isDate, 
    greaterThan: greaterThan
}