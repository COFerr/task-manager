const form = document.getElementById('newTask')
const user = document.getElementById('user')
let modal = document.getElementsByClassName("modal")[0]
let tasks = []
let isResponsiveStatus = false
let isResponsiveDeadline = false
let filterAtribute = 'all'
let sort = "number"
let order = "asc"
let isDelayed = false
let isAtodayTask = false
let page = 1
const tasksPerPage = 10

async function newRegister() {
    let registerModal = document.getElementsByClassName("registerModal")[0]
    const userName = user.elements['userName'].value
    const password = user.elements['password'].value
    if (userName !== '' && password.length >= 6) {
        const apiResponse = await fetch('https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/profile')
        profile = await apiResponse.json()
        profile = profile.filter(function (element) {
            return (userName === element.userName)
        })

        if (profile.length !== 0) {
            alert("Usuário já cadastrado")
        }
        else {

            saveNewUser({ userName, password })
            user.elements['userName'].value = ""
            user.elements['password'].value = ""
            alert("Usuário cadastrado com sucesso")
        }
    }
    else alert("Usuário não pode estar em branco/A senha deve possuir pelo menos 6 caracteres")
}
const saveNewUser = async (user) => {
    await fetch("https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/profile", {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "userName": user.userName,
            "password": user.password,
        })
    });
}
const register = async (userData) => {
    const apiResponse = await fetch('https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/profile?_sort=id&_order=desc')
    profile = await apiResponse.json()
    for (let i = 0; i < profile.length; i++) {
        if (profile[i].userName === userData.userName && profile[i].password === userData.password) {
            registerModal.style.display = 'none';
            renderPage()
            getTasks()
            return null
        }
    }
    alert('Usuário e/ou senha incorretos')
}

function renderOptions() {
    let options = document.querySelector('.options')
    options.innerHTML = `
    <button class="addTask" onclick="openModal()">+ Adicionar Tarefa</button>
    <button class="changeColors" onclick="changeColors()">inverter Cores</button>    
    `
}
function renderTasksExibit() {
    let tasksExibit = document.querySelector('.tasksExibit')
    tasksExibit.innerHTML = `
<select class="tasksResponsive">
    <optgroup>
      <option value="Todas">Todas</option>
      <option value="Concluídas">Concluídas</option>
      <option value="Em andamento">Em andamento</option>
      <option value="Parada">Parada</option>
      <option value="Hoje">Hoje</option>
      <option value="Atrasadas">Atrasadas</option>
    </optgroup>
</select>
<button class="tasksResponsive" onclick="selectTasks()">Listar tarefas</button>
<button class="tasksFilter" onclick="choseTasks('all')">Todas</button>
<button class="tasksFilter" onclick="choseTasks('concluido')">Concluídas</button>
<button class="tasksFilter" onclick="choseTasks('Em andamento')">Em andamento</button>
<button class="tasksFilter" onclick="choseTasks('Parada')">Parada</button>
<button class="tasksFilter" onclick="expiresToday()">Hoje</button>
<button class="tasksFilter" onclick="getDelayedTasks()">Atrasadas</button>
<input type="text" class="tasksFilterInput" placeholder='pesquisar' onblur="search()" onkeyup="search()"/>
`
}
function renderTable() {
    let table = document.querySelector(".table")
    table.innerHTML = `
    <thead class="tableHead">
    <tr>
      <th scope="col" class="table-secondary" id="num">
        <div class="th-display">
          <div>Núm</div>
          <div class="th-buttons">
            <button onclick="ordenateTasks('number','desc')" id="orderButton"><i class="fa-solid fa-sort-up"></i></button>
            <button onclick="ordenateTasks('number',  'asc')" id="orderButton"><i class="fa-solid fa-sort-down"></i></button>
          </div>
        </div>
      </th>
      <th scope="col" class="table-secondary" id="description">
        <div class="th-display">
            <div>Descrição</div>
            <div class="th-buttons">
                <button onclick="ordenateTasks('description', 'desc')" id="orderButton"><i class="fa-solid fa-sort-up"></i></button>
                <button onclick="ordenateTasks('description', 'asc')" id="orderButton"><i class="fa-solid fa-sort-down"></i></button>
            </div>
            <div class="th-responsive-buttons">
                <button class='showResponsiveDeadLine' onclick="showResponsiveDeadLine(this)"><i class="fa-solid fa-circle-plus"></i></button>
                <button class='unshowResponsiveDeadLine' onclick="unshowResponsiveDeadLine(this)"><i class="fa-solid fa-circle-minus"></i></button>
                <button class ='showResponsiveStatus' onclick="showResponsiveStatus(this)"><i class="fa-solid fa-circle-plus"></i></button>
                <button class ='unshowResponsiveStatus' onclick="unshowResponsiveStatus(this)"><i class="fa-solid fa-circle-minus"></i></button>
            </div>
        </div>
      </th>
      <th scope="col" class="table-secondary noShowResponsive" id="deadLine">
        <div class="th-display">
          <div>Data de Entrega</div>
          <div class="th-buttons">
            <button onclick="ordenateTasks('deadLine', 'desc')" id="orderButton"><i class="fa-solid fa-sort-up"></i></button>
            <button onclick="ordenateTasks('deadLine', 'asc')" id="orderButton"><i class="fa-solid fa-sort-down"></i></button>
          </div>
        </div>
      </th>
      <th scope="col" class="table-secondary table-status noShowResponsive" id="status">
        <div class="th-display">
          <div>Status</div>
          <div class="th-buttons">
            <button onclick="ordenateTasks('status', 'desc')" id="orderButton"><i class="fa-solid fa-sort-up"></i></button>
            <button onclick="ordenateTasks('status', 'asc')" id="orderButton"><i class="fa-solid fa-sort-down"></i></button>
          </div>
        </div>
      </th>
      <th scope="col" class="table-secondary" id="action">Ação</th>
    </tr>
  </thead>
  <tbody class="tableBody" id="tasks">
  </tbody>
  <div class="nothingToShow">
    <h2 class="no_tasks">Sem tarefas a exibir</h2>
  </div>
  `
}

function renderPreviusNextButtons() {
    let previusNextButtons = document.querySelector(".previusNextButtons")
    previusNextButtons.innerHTML =
        `
    <button id="previus" onclick="previusPage()"><i class="fa-solid fa-circle-chevron-left"></i> anterior</button>
    <button id="next" onclick="nextPage()">proxima <i class="fa-solid fa-circle-chevron-right"></i></button>
    `
}
function renderPage() {
    renderOptions()
    renderTasksExibit()
    renderTable()
    renderPreviusNextButtons()
}

if (user) {
    user.addEventListener('submit', (event) => {
        event.preventDefault()
        const userName = user.elements['userName'].value
        const password = user.elements['password'].value
        register({ userName, password })
    })
}

function showResponsiveStatus(btn) {
    if(btn === "") btn = document.querySelector(".showResponsiveStatus")
    isResponsiveStatus = true
    let bodyStatus = document.querySelectorAll('.taskStatus')
    let headStatus = document.querySelector('.table-status')
    let showBtn = document.querySelector('.unshowResponsiveStatus')
    headStatus.classList.remove('noShowResponsive')
    for(let i=0;i< bodyStatus.length; i++){
        bodyStatus[i].classList.remove('noShowResponsive')
    }
    showBtn.style.display = "inline"
    btn.style.display = "none"
}

function unshowResponsiveStatus(btn) {
    isResponsiveStatus = false
    let bodyStatus = document.getElementsByClassName('taskStatus')
    let headStatus = document.querySelector('.table-status')
    let showBtn = document.querySelector('.showResponsiveStatus')
    headStatus.classList.add('noShowResponsive')
    for(let i=0;i< bodyStatus.length; i++){
        bodyStatus[i].classList.add('noShowResponsive')
    }
    showBtn.style.display = "inline"
    btn.style.display = "none"
}

function showResponsiveDeadLine(btn) {
    isResponsiveDeadline = true
    if(btn === "") btn = document.querySelector('.showResponsiveDeadLine')
    let bodyStatus = document.querySelectorAll('.table-deadLine')
    let headDeadline = document.querySelector('#deadLine')
    let showBtn = document.querySelector('.unshowResponsiveDeadLine')
    headDeadline.classList.remove('noShowResponsive')
    for(let i=0;i< bodyStatus.length; i++){
        bodyStatus[i].classList.remove('noShowResponsive')
    }
    showBtn.style.display = "inline"
    btn.style.display = "none"
}
function unshowResponsiveDeadLine(btn) {
    isResponsiveDeadline = false
    let bodyStatus = document.querySelectorAll('.table-deadLine')
    let headDeadline = document.querySelector('#deadLine')
    let showBtn = document.querySelector('.showResponsiveDeadLine')
    headDeadline.classList.add('noShowResponsive')
    for(let i=0;i< bodyStatus.length; i++){
        bodyStatus[i].classList.add('noShowResponsive')
    }
    showBtn.style.display = "inline"
    btn.style.display = "none"
}

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

function changeColors() {
    var root = document.querySelector(':root');
    let content = document.querySelector('.content')
    let stripe = document.querySelector('.stripe')
    let purpleStripe = document.querySelector('.purpleStripe')
    let logo = document.querySelector('.logo')
    let checkLogo = document.querySelector('.checkLogo')
    let changeColors = document.querySelector('.changeColors')
    let title = document.querySelector('.title')
    let previus = document.querySelector('#previus')
    let next = document.querySelector('#next')
    if (content.style.backgroundColor === 'white' || content.style.backgroundColor==="") {        
        root.style.setProperty('--mainYellow', '#68519D')
        root.style.setProperty('--mainPurple', 'black')
        root.style.setProperty('--tableColor', 'white')
        root.style.setProperty('--btnHoverBgColor', '#F8B04E')
        title.style.color = 'white'
        changeColors.style.backgroundColor = '#F8B04E'
        changeColors.style.color = 'white'
        content.style.backgroundColor = '#68519D'
        previus.style.color = "#f1be77"
        next.style.color = "#f1be77"
        stripe.style.backgroundColor = '#68519D'
        purpleStripe.style.backgroundColor = '#F8B04E'
        logo.src = 'logo_arnia_contraste.svg'
        checkLogo.src = 'managerIconWhite.svg'
    }
    else {
        root.style.setProperty('--mainYellow', '#F8B04E')
        root.style.setProperty('--mainPurple', '#68519D')
        root.style.setProperty('--tableColor', '#68519D')
        root.style.setProperty('--btnHoverBgColor', '#68519D')
        content.style.backgroundColor = 'white'
        content.style.color = 'var(--mainPurple)'
        title.style.color = 'var(--mainPurple)'
        changeColors.style.backgroundColor = 'var(--mainPurple)'
        changeColors.style.color = 'var(--lightYellow)'
        previus.style.color = 'var(--mainPurple)'
        next.style.color = 'var(--mainPurple)'
        logo.src = 'logo_arnia.svg'
        checkLogo.src = 'managerIconBlue.svg'
        stripe.style.backgroundColor = 'white'
        purpleStripe.style.backgroundColor = 'var(--mainPurple)'
    }
}

const saveTask = async (task) => {
    await fetch("https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts", {
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
    const apiResponse = await fetch('https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts?_sort=id&_order=desc')
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
    nothingToShow = document.querySelector('.nothingToShow')
    if (tasks != '') {
        nothingToShow.style.display = 'none'
        tasksContent.innerHTML = ''
        tasks.forEach((task) => {
            tasksContent.innerHTML = tasksContent.innerHTML + `
        <tr>
            <td>${task.number}</td>
            <td>${task.description}</td>
            <td class = "table-deadLine noShowResponsive">${task.deadLine}</td>
            <td class = 'taskStatus noShowResponsive'>${task.status}</td>
            <td class = "actionIcons noShowREsponsive">
                <div><button id = "${task.id}" onclick = 'editTask(this.id)'><img src='pencilVector.svg'/></button></div>
                <div><button id = "${task.id}" onclick = 'deleteTask(this.id)'><img src='trashVector.svg'/></button></div>
            </td>
        </tr>
        `
        })
    }
    else {
        tasksContent.innerHTML = ''
        nothingToShow.style.display = 'block'
    }
    paintStatus()
    if(isResponsiveDeadline) showResponsiveDeadLine(document.querySelector('.showResponsiveDeadLine'))
    if(isResponsiveStatus) showResponsiveStatus(document.querySelector('.showResponsiveStatus'))
}
function search() {
    page = 1
    const task = document.getElementsByClassName('tasksFilterInput')[0].value
    filterAtribute = task
    getTasks()
}
function selectTasks() {
    page = 1
    const selection = document.getElementsByClassName("tasksResponsive")[0].value
    if (selection === 'Todas') { filterAtribute = ('all'); getTasks() }
    else if (selection === 'Em andamento') { filterAtribute = ('Em andamento'); getTasks() }
    else if (selection === 'Concluídas') { filterAtribute = ('concluido'); getTasks() }
    else if (selection === 'Parada') { filterAtribute = ('Parada'); getTasks() }
    else if (selection === 'Hoje') expiresToday()
    else if (selection === 'Atrasadas') getDelayedTasks()
}

async function choseTasks(filterWord) {
    page = 1
    if (filterWord === 'all') filterAtribute = 'all'
    else if (filterWord === 'Em andamento') filterAtribute = 'Em andamento'
    else if (filterWord === 'concluido') filterAtribute = 'concluido'
    else if (filterWord === 'Parada') filterAtribute = 'Parada'
    getTasks()
}
function expiresToday() {
    page = 1
    now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth()+1
    let day = now.getDate()
    const fullDate = (`${year}-${month}-${day}`)
    filterAtribute = fullDate
    getTasks()
}

const getDelayedTasks = async () => {
    if(!isDelayed) page = 1
    isDelayed = true
    const apiResponse = await fetch(`https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts?_sort=${sort}&_order=${order}`)
    let tasks = await apiResponse.json()
    const now = new Date()
    tasks = tasks.filter(function (element) {
        const deadLineDate = new Date(element.deadLine)
        if (deadLineDate.getFullYear() < now.getFullYear() && element.status !== 'concluido') return true
        else if (deadLineDate.getFullYear() === now.getFullYear() && deadLineDate.getMonth() < now.getMonth() && element.status !== 'concluido') return true
        else if (deadLineDate.getFullYear() === now.getFullYear() && deadLineDate.getMonth() === now.getMonth() && deadLineDate.getDate() + 1 < now.getDate() && element.status !== 'concluido') {
            return true
        }
        else return false
    })
    tasks = tasks.slice((page-1)*tasksPerPage,page*(tasksPerPage))
    if (tasks.length === tasksPerPage) {
        next.disabled = false
    }
    else if (tasks == '') {
        next.disabled = true
    }
    else if (tasks.length < tasksPerPage && tasks.length > 0) {
        next.disabled = true
    }
    renderTasks(tasks)
}

const getTasks = async () => {
    isDelayed = false
    let tasks = ''
    let link = `https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts?_page=${page}&_limit=10`
    if (filterAtribute === 'all') {
        document.querySelector('.previusNextButtons').style.display = 'block';
        const apiResponse = await fetch(`${link}&_sort=${sort}&_order=${order}`)
        tasks = await apiResponse.json()
    }
    else if (filterAtribute === 'Em andamento') {
        document.querySelector('.previusNextButtons').style.display = 'block';
        const apiResponse = await fetch(`${link}&status=Em andamento&_sort=${sort}&_order=${order}`)
        tasks = await apiResponse.json()
    }
    else if (filterAtribute === 'concluido') {
        document.querySelector('.previusNextButtons').style.display = 'block';
        const apiResponse = await fetch(`${link}&status=concluido&_sort=${sort}&_order=${order}`)
        tasks = await apiResponse.json()
    }
    else if (filterAtribute === 'Parada') {
        document.querySelector('.previusNextButtons').style.display = 'block';
        const apiResponse = await fetch(`${link}&status=Parada&_sort=${sort}&_order=${order}`)
        tasks = await apiResponse.json()
    }
    else{
        const apiResponse = await fetch(`https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts?_sort=number&_order=asc`)
        tasks = await apiResponse.json()
        tasks = tasks.filter(function (element) {
            deadLine = element.deadLine.split('-')
            return (element.number === filterAtribute || element.description.toLowerCase().includes(filterAtribute.toString().toLowerCase()) || element.deadLine.includes(filterAtribute)|| `${Number(deadLine[0])}-${Number(deadLine[1])}-${Number(deadLine[2])}` === filterAtribute)
        })
        tasks = tasks.slice((page-1)*tasksPerPage,page*(tasksPerPage))
    }
    if (tasks.length === tasksPerPage) next.disabled = false
    else if (tasks.length < tasksPerPage && tasks.length > 0) next.disabled = true
    else if (tasks == '') next.disabled = true
    renderTasks(tasks)
}
    
function ordenateTasks(sortByThis, orderLikeThis) {
    sort = sortByThis
    order = orderLikeThis
    if (isDelayed) getDelayedTasks()
    else getTasks()
}
function nextPage() {
    page += 1
    if (isDelayed) getDelayedTasks()
    else getTasks()
}

function previusPage() {
    if (page > 1) {
        page -= 1
        next.disabled = false
        if (isDelayed) getDelayedTasks()
        else getTasks()
    }
}

const getTask = async (id) => {
    const apiResponse = await fetch(`https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts/${id}`)
    const task = await apiResponse.json()
    return task
}

const editTask = async (id) => {
    task = await getTask(id)
    document.getElementById('number').value = task.number
    document.getElementById('descriptionModal').value = task.description
    document.getElementById('deadLineModal').value = task.deadLine
    document.getElementById('statusModal').value = task.status
    openModal()
}

const deleteTask = async (id) => {
    task = await getTask(id)
    if (confirm(`Deseja apagar a tarefa ${task.number}`)) {
        await fetch(`https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts/${id}`, {
            method: 'DELETE'
        })
        filterAtribute = 'all'
        getTasks()
    }
}

const updateTask = async (id, task) => {
    await fetch(`https://json-server-vercel-lg6cj1nhr-coferr.vercel.app/server.js/posts/${id}`, {
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
        else if (status[i].innerHTML === 'Em andamento') status[i].style.color = '#F8B04E'
        else if (status[i].innerHTML === 'Parada') status[i].style.color = 'red'
    }
}
