module.exports = function(obj) {
    if (Array.isArray(obj)) return obj;
    else return Object.keys(obj);
}