class Caser {
    static snakeToCamel(str) {
        return str.split('_').map((word,index)=>{
            if (index === 0) { return word.toLowerCase(); }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('');
    }
    static camelToSnake(str) { return str.split(/(?=[A-Z])/).join('_').toLowerCase() }
}
