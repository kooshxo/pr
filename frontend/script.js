const input = document.getElementById("url")
const frame = document.getElementById("frame")
const loading = document.getElementById("loading")

let historyStack = []
let historyIndex = -1

// Set your backend URL here when deploying separately
const backendUrl = 'https://pr-bs4c.onrender.com'; // Replace with actual backend URL

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker registration failed', err));
}

frame.onload = () => {
  loading.classList.remove("show")
}

function formatInput(value){

if(value.includes(".") && !value.includes(" ")){
return value.startsWith("http") ? value : "https://" + value
}

return "https://www.google.com/search?q=" + encodeURIComponent(value)

}

function go(){

const value = input.value.trim()

if(!value) return

const url = formatInput(value)

load(url)

}

function load(url){

loading.classList.add("show")

const cleanedBackend = backendUrl.replace(/\/$/, "")
frame.src = `${cleanedBackend}/proxy?url=` + encodeURIComponent(url)

historyStack = historyStack.slice(0, historyIndex + 1)
historyStack.push(url)
historyIndex++

}

function back(){

if(historyIndex > 0){
historyIndex--
load(historyStack[historyIndex])
input.value = historyStack[historyIndex]
}

}

function forward(){

if(historyIndex < historyStack.length - 1){
historyIndex++
load(historyStack[historyIndex])
input.value = historyStack[historyIndex]
}

}

function reload(){

if(historyIndex >= 0){
load(historyStack[historyIndex])
}

}

input.addEventListener("keydown",(e)=>{
if(e.key === "Enter"){
go()
}
})