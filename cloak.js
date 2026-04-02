if(window.top === window.self){

let win = window.open("about:blank","_blank")

win.document.write(`
<title>Google Classroom</title>
<link rel="icon" href="https://ssl.gstatic.com/classroom/favicon.png">
<style>body{margin:0}</style>
<iframe src="${location.href}" style="border:none;width:100vw;height:100vh"></iframe>
`)

location.replace("https://www.google.com")

}