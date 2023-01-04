const form = document.getElementById('newTask')
let modal = document.getElementsByClassName("modal")[0]
let tasks = []
let aux = []
let page = 1
let filterAtribute = 'all'
let isDelayed = false

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none'
    let number = document.getElementById("number")
    let descriptionModal = document.getElementById("descriptionModal")
    let deadLineModal = document.getElementById("deadLineModal")
    let statusModal = document.getElementById("statusModal")
    number.value = ""
    descriptionModal.value = ""
    deadLineModal.value = ""
    statusModal = ""
}

function enableButton() {
    let button = document.getElementsByClassName("saveTask")[0]
    button.disabled = false
}


const saveTask = async (task) => {
    await fetch("https://json-server-vercel-lyart.vercel.app/posts", {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "number": task.number,
            "description": task.description,
            "deadLine": task.deadLine,
            "status": task.status
        })
    });
}

const addTask = async (task) => {
    await saveTask(task)
    filterAtribute = 'all'
    getTasks()
    closeModal()
}

if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault()

        const number = Number(form.elements['number'].value)
        const description = form.elements['description'].value
        const deadLine = form.elements['deadLine'].value
        const status = form.elements['status'].value

        validateForm({ number, description, deadLine, status })
    })
}

const validateForm = async (task) => {
    const apiResponse = await fetch('https://json-server-vercel-lyart.vercel.app/posts?_sort=id&_order=desc')
    tasks = await apiResponse.json()
    for (let i = 0; i < tasks.length; i++) {
        if (task.number === tasks[i].number) {
            if (confirm(`Tarefa ${task.number} já cadastrada. Deseja sobrescrever?`)) updateTask(tasks[i].id, task)
            else closeModal()
            return false
        }
    }
    addTask(task)
    return true;
}

const renderTasks = (tasks) => {
    const tasksContent = document.getElementById('tasks')
    tasksContent.innerHTML = ''
    tasks.forEach((task) => {
        tasksContent.innerHTML = tasksContent.innerHTML + `
        <tr>
            <td>${task.number}</td>
            <td>${task.description}</td>
            <td>${task.deadLine}</td>
            <td class = 'taskStatus'>${task.status}</td>
            <td class = "actionIcons">
                <div><button id = "${task.id}" onclick = 'editTask(this.id)'><img src='pencilVector.svg'/></button></div>
                <div><button id = "${task.id}" onclick = 'deleteTask(this.id)'><img src='trashVector.svg'/></button></div>
            </td>
        </tr>
      `
    })
    paintStatus()
}
function search(){
    const task = document.getElementsByClassName('tasksFilterInput')[0].value
    filterAtribute = task
    getTasks()
}
function expiresToday(){
    now = new Date()
    month = now.getMonth() + 1
    fullDate = (now.getFullYear() + "-" + month + "-" + now.getDate())
    filterAtribute = fullDate
    getTasks()
}

const getDelayedTasks = async () => {
    isDelayed = true
    const apiResponse = await fetch('https://json-server-vercel-lyart.vercel.app/posts?_sort=number&_order=asc')
    let tasks = await apiResponse.json()
    const now = new Date()
    tasks = tasks.filter(function(element){
        const deadLineDate = new Date(element.deadLine)
        console.log(deadLineDate.getDate())
        //const [deadLineYear, deadLineMonth, deadLineDate] = element.deadLine.split('-')
        if(deadLineDate.getFullYear() < now.getFullYear() && element.status !== 'concluido') return true
        else if(deadLineDate.getFullYear() === now.getFullYear() && deadLineDate.getMonth() < now.getMonth() && element.status !== 'concluido') return true
        else if(deadLineDate.getFullYear() === now.getFullYear() && deadLineDate.getMonth() === now.getMonth() && deadLineDate.getDate()+1 < now.getDate() && element.status !== 'concluido'){
            console.log(deadLineDate.getDate() + " " + element.number)
            return true            
        }
        else return false
    })
    renderTasks(tasks)
}

function selectTasks(){
    page = 1
    const selection = document.getElementsByClassName("tasksResponsive")[0].value
    if(selection === 'Todas') filterAtribute = ('all')
    else if(selection === 'Em andamento') filterAtribute = ('em_andamento')
    else if(selection === 'Concluídas') filterAtribute = ('concluido')
    else if(selection === 'Pausadas') filterAtribute = ('stopped')
    else if(selection === 'Hoje') expiresToday()
    else if(selection === 'Atrasadas') getDelayedTasks()
    getTasks()
}
async function choseTasks(filterWord){
    page = 1
    if(filterWord === 'all') filterAtribute = 'all'
    else if(filterWord === 'em_andamento') filterAtribute = 'em_andamento'
    else if(filterWord === 'concluido') filterAtribute = 'concluido'
    else if(filterWord === 'stopped') filterAtribute = 'stopped'
    await getTasks()
    enablePaginationButtons()
}
const getTasks = async () => {
    isDelayed = false
    let tasks = ''
    let link = `https://json-server-vercel-lyart.vercel.app/posts?_page=${page}&_limit=10`
    if (filterAtribute === 'all') {
        console.log('aqui ' + page)
        const apiResponse = await fetch(`${link}&_sort=number&_order=asc`)
        tasks = await apiResponse.json()
    }
    else if(filterAtribute === 'em_andamento'){
        const apiResponse = await fetch(`${link}&status=em_andamento&_sort=number&_order=asc`)
        tasks = await apiResponse.json()  
    }
    else if(filterAtribute === 'concluido'){
        const apiResponse = await fetch(`${link}&status=concluido&_sort=number&_order=asc`)
        tasks = await apiResponse.json()        
    }
    else if(filterAtribute === 'stopped'){
        const apiResponse = await fetch(`${link}&status=stopped&_sort=number&_order=asc`)
        tasks = await apiResponse.json()
    }
    else{
        const apiResponse = await fetch(`https://json-server-vercel-lyart.vercel.app/posts?_sort=number&_order=asc`)
        tasks = await apiResponse.json()
        tasks = tasks.filter(function(element){
            return (element.number === filterAtribute || element.description.includes(filterAtribute) || element.deadLine.includes(filterAtribute))
        })
    }
    if(tasks.length === 10 ){
        renderTasks(tasks)
    }
    else if(tasks.length < 10 && tasks.length > 0){
        next.disabled = true
        renderTasks(tasks)
    }
    else{
        page = page - 1
        next.disabled = true
    }    
}
function nextPage(){
    console.log("aqui " + page)
    page += 1
    if(isDelayed) getDelayedTasks()
    else getTasks()
}

function previusPage(){
    if(page > 1){
        page -= 1
        next.disabled = false
        if(isDelayed) getDelayedTasks()
        else getTasks()
    }    
}
function enablePaginationButtons(){
    previus.addEventListener('click', previusPage)
    next.addEventListener('click', nextPage)
}
enablePaginationButtons()

const getTask = async (id) => {
    const apiResponse = await fetch(`https://json-server-vercel-lyart.vercel.app/posts/${id}`)
    const task = await apiResponse.json()
    return task
}

const editTask = async (id) => {
    task = await getTask(id)
    console.log(task)
    document.getElementById('number').value = task.number
    document.getElementById('descriptionModal').value = task.description
    document.getElementById('deadLineModal').value = task.deadLine
    document.getElementById('statusModal').value = task.status
    openModal()
    console.log(`função '${id}' editada`)
}

const deleteTask = async (id) => {
    task = await getTask(id)
    if (confirm(`Deseja apagar a tarefa ${task.number}`)) {
        await fetch(`https://json-server-vercel-lyart.vercel.app/posts/${id}`, {
            method: 'DELETE'
        })
        filterAtribute = 'all'
        getTasks()
    }
}

const updateTask = async (id, task) => {
    await fetch(`https://json-server-vercel-lyart.vercel.app/posts/${id}`, {
        method: "PUT",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "number": task.number,
            "description": task.description,
            "deadLine": task.deadLine,
            "status": task.status
        })
    })

    filterAtribute = 'all'
    getTasks()
    closeModal()
}

function paintStatus() {
    let status = document.getElementsByClassName('taskStatus')
    for (let i = 0; i < status.length; i++) {
        if (status[i].innerHTML === 'concluido') status[i].style.color = 'green'
        else if (status[i].innerHTML === 'em_andamento') status[i].style.color = '#F8B04E'
        else if (status[i].innerHTML === 'stopped') status[i].style.color = 'red'
    }
}
