class ElapsedTime {
    UNITS = [
        {
            second: 's',
            minute: 'm',
            hour: 'h',
            day: 'd',
            week: 'w',
            month: 'M',
            year: 'y',
        },
        {
            second: '秒',
            minute: '分',
            hour: '時間',
            day: '日',
            week: '週',
            month: 'ヶ月',
            year: '年',
        },
    ]
    THRESHOLDS = [60, 3600, 86400, 604800, 2592000, 946080000] // 秒, 分, 時, 日, 週, 月, 年
    //THRESHOLDS = [946080000, 2592000, 604800, 86400, 3600, 60] // 年, 月, 週, 日, 時, 分, 秒
    static now() { return new Date().getTime() / 1000 }
    static from(i) { return Math.floor(new Date().getTime() / 1000) - i }
    static elapsed(target, now=null) {
        const base = (now) ? now : this.now()
        return base - target
    }
    /*
    static format(value, unitId=0) {
        for (let i=0; i<ElapsedTime.THRESHOLDS; i++) {
            if ((value / ElapsedTime.THRESHOLDS[i]) < 1) {
                return value + ElapsedTime.UNITS[unitId].second
            }
            if (i < ElapsedTime.THRESHOLDS[i]) {
                (0<i) ? (i / ElapsedTime.THRESHOLDS[i-1]))
                return i + ElapsedTime.UNITS[unitId].second
            }
        }
        for (const threashold of ElapsedTime.THRESHOLDS) {
            if (i < threashold) { return i + ElapsedTime.UNITS[unitId].second }
            
        }
        if (i < 60) { return i + ElapsedTime.UNITS[unitId].second }
        else if (i < 3600) { return Math.floor(i / ) + ElapsedTime.UNITS[unitId].minute }
        else if (i < 86400) { return i + ElapsedTime.UNITS[unitId].hour }
    }
    */
    /*
    static nowDate() { return new Date() }
    static nowUnix() { return new Date().getTime() / 1000 }
    static fromUnix(i) { return Math.floor(new Date().getTime() / 1000) - i }
    static fromDate(d) { return new Date() - d }
    */
}
