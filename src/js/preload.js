const {remote,contextBridge,ipcRenderer} =  require('electron');
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld('myApi', {
    /*
    loadDb:async(filePath)=>await ipcRenderer.invoke('loadDb', filePath),
    get:async()=>await ipcRenderer.invoke('get'),
    insert:async(record)=>await ipcRenderer.invoke('insert', record),
    clear:async()=>await ipcRenderer.invoke('delete'),
    delete:async(ids)=>await ipcRenderer.invoke('delete', ids),
    exportDb:async()=>await ipcRenderer.invoke('exportDb'),
    */
    exists:async(path)=>await ipcRenderer.invoke('exists', path),
    mkdir:async(path)=>await ipcRenderer.invoke('mkdir', path),
    readFile:async(path, kwargs)=>await ipcRenderer.invoke('readFile', path, kwargs),
    readTextFile:async(path, encoding='utf8')=>await ipcRenderer.invoke('readTextFile', path, encoding),
    writeFile:async(path, data)=>await ipcRenderer.invoke('writeFile', path, data),
    shell:async(command)=>await ipcRenderer.invoke('shell', command),
    testRequest:async(params)=>await ipcRenderer.invoke('testRequest'),
    githubUser:async(token)=>await ipcRenderer.invoke('githubUser', token),
    request:async(params)=>await ipcRenderer.invoke('request', params, onData=null, onEnd=null),
    //request:async(params)=>await ipcRenderer.invoke('request', params),
    /*
    open:async()=>await ipcRenderer.invoke('open'),
    save:async()=>await ipcRenderer.invoke('save'),
    readFile:(path, kwargs=null)=>{
        //if (!kwargs) { kwargs = { encoding: 'utf8' } }
        return fs.readFileSync(path, kwargs)
    },
    writeFile:(path, data)=>fs.writeFileSync(path, data),
    runShell:async()=>await ipcRenderer.invoke('shell'),
    */
})

