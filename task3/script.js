
let tasks = [];
let currentFilter = 'all';


const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const errorMsg = document.getElementById('error-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const countActiveEl = document.getElementById('count-active');
const countCompletedEl = document.getElementById('count-completed');

function addTask() {
    const text = taskInput.value.trim();


    if (text === '') {
        errorMsg.classList.add('visible');
        return;
    }

    errorMsg.classList.remove('visible');


    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = ''; 
    render(); 
}


function render() {
    
    taskList.innerHTML = '';

   
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
       
        if (task.completed) {
            li.classList.add('completed');
        }

 
        if (
            (currentFilter === 'active' && task.completed) ||
            (currentFilter === 'completed' && !task.completed)
        ) {
            li.classList.add('hidden');
        }

      
        li.innerHTML = `
            <label class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text">${task.text}</span>
            </label>
            <button class="delete-btn" data-id="${task.id}">&times;</button>
        `;

        taskList.appendChild(li);
    });


    const activeCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;
    
    countActiveEl.textContent = activeCount;
    countCompletedEl.textContent = completedCount;
}




addBtn.addEventListener('click', addTask);


taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});


taskList.addEventListener('click', (e) => {
    const target = e.target;
    const id = Number(target.getAttribute('data-id'));


    if (target.matches('input[type="checkbox"]') || target.closest('.task-content')) {

        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            render();
        }
    }

 
    if (target.matches('.delete-btn')) {
        tasks = tasks.filter(t => t.id !== id);
        render();
    }
});


filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {

        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');


        currentFilter = e.target.getAttribute('data-filter');
        render();
    });
});


render();