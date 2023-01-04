const form = document.getElementById('newTask')
let modal = document.getElementsByClassName("modal")[0]
let tasks = []

function openModal(){
    modal.style.display = 'block';    
}

function closeModal(){
    modal.style.display = 'none'
    let number = document.getElementById("number")
    let descriptionModal = document.getElementById("descriptionModal")
    let deadLineModal = document.getElementById("deadLineModal")
    let statusModal = document.getElementById("statusModal")
    number.value = ""
    descriptionModal.value = ""
    deadLineModal.value = ""
    statusModal.value = ""
}

function enableButton(){
    let button = document.getElementsByClassName("saveTask")[0]
    button.disabled = false
}

function clicou(){
    alert("clicou")

    let number = document.getElementById("number")
    let descriptionModal = document.getElementById("descriptionModal")
    let deadLineModal = document.getElementById("deadLineModal")
    let statusModal = document.getElementById("statusModal")
}

const saveTask = async (task) => {
    await fetch("http://localhost:3000/posts", {
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
    getTasks()
    closeModal()  
}

if(form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault()
    
      const number = form.elements['number'].value
      const description = form.elements['description'].value
      const deadLine = form.elements['deadLine'].value
      const status = form.elements['status'].value

      validateForm({ number, description, deadLine, status }) 
    })
  }
  
  const validateForm = async (task) =>{  
    const apiResponse = await fetch('http://localhost:3000/posts?_sort=id&_order=desc')
    const tasks = await apiResponse.json()
    for(let i=0; i < tasks.length; i++){
        if(task.number === tasks[i].number){
            console.log("iguais")
            if(confirm("Tarefa número "+ task.number +" já cadastrada. deseja alterar?")){
                updateTask(tasks[i].id, task)
            }
            else closeModal()
            return false
        }
    }
    console.log('sem ocorrências')
    addTask({ number, description, deadLine, status })
  }
  const renderTasks = (tasks) => {
    const tasksContent = document.getElementById('tasks')
    tasksContent.innerHTML = ''
  
    tasks.forEach((task) => {
      tasksContent.innerHTML = tasksContent.innerHTML + `
        <tr>
            <td>'${task.number}'</td>
            <td>'${task.description}'</td>
            <td>'${task.deadLine}'</td>
            <td>'${task.status}'</td>
            <td class = "actionIcons">
                <div><button id = "${task.id}" onclick = 'editTask(this.id)'><img src='pencilVector.svg'/></button></div>
                <div><button id = "${task.id}" onclick = 'deleteTask(this.id)'><img src='trashVector.svg'/></button></div>
            </td>
        </tr>
      `
    })
}
const getTasks = async () =>{  
    const apiResponse = await fetch('http://localhost:3000/posts?_sort=number&_order=asc')
    const tasks = await apiResponse.json()
    renderTasks(tasks)
}
const getTask = async (id) => {
    const apiResponse = await fetch(`http://localhost:3000/posts/${id}`)
    const task = await apiResponse.json()
    return task
}
const editTask = async (id) => {
    let task = await getTask(id)
    console.log(task)
    document.getElementById('number').value = task.number
    document.getElementById('descriptionModal').value = task.description
    document.getElementById('deadLineModal').value = task.deadLine
    document.getElementById('statusModal').value = task.status
    openModal()

    console.log(`função '${id}' editada`)
}

const updateTask = async (id, task) => {
    await fetch(`http://localhost:3000/posts/${id}`, {
        method: "PUT",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    })
    getTasks()
    closeModal()
}

const deleteTask = async (id) => {
    await fetch(`http://localhost:3000/posts/${id}`, {
        method: 'DELETE'
    })
    getTasks()
}

const getDelayedTasks = async () => {
    const apiResponse = await fetch('http://localhost:3000/posts?_sort=number&_order=asc')
    let tasks = await apiResponse.json()
    const now = new Date()
    const month = now.getMonth() + 1
    const today = now.getDate()
    const deadLineDate = new Date(element.deadLine)
    console.log(deadLine)
    tasks = tasks.filter(function(element){
        //const [deadLineYear, deadLineMonth, deadLineDate] = element.deadLine.split('-')
        if(deadLineDate.getFullYear() < now.getFullYear() && element.status !== 'concluido') return true
        else if(deadLineDate.getFullYear() === now.getFullYear() && deadLineDate.getMonth() < now.getMonth() && element.status !== 'concluido') return true
        else if(deadLineDate.getFullYear() === now.getFullYear() && deadLineDate.getMonth() === now.getMonth() && deadLineDate.getDate() < now.getDate() && element.status !== 'concluido') return true
        else return false
    })
    renderTasks(tasks)
}
let link = `http://localhost:3000/posts?_page=${page}&_limit=7`
let pagesCount = 0
let tasksPerPage = 7
function paginateTasks(tasks){
    const previus = document.getElementById('previus')
    const next = document.getElementById('next')
    page = 1;
    cont = (page-1)*tasksPerPage;
    while(cont < tasksPerPage){
        aux.push(tasks[cont])
    }
    renderTasks[aux]
    aux = []
    previus.addEventListener('click', function(){
        if(page > 0){page -= 1; paginateTasks(tasks)}
    })
    next.addEventListener('click', function(){
        if(page < pagesCount){page += 1; paginateTasks(tasks)}
    })    
}