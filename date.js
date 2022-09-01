exports.getDate = ()=>{
    let today = new Date();
    let currentDay = today.getDay();

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    
    let day = today.toLocaleDateString("en", options);
    return day;
}