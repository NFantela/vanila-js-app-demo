import '../assets/css/style.css';

const app = document.getElementById('app');

app.innerHTML = `
  <div class="todos">
    <div class="todos-header">
      <h3 class="todos-title">Todo List</h3>
      <div>
        <p>You have <span class="todos-count"></span> items</p>
        <button type="button" class="todos-clear" style="display: none;">
          Clear Completed
        </button>
      </div>
    </div>
    <form class="todos-form" name="todos">
      <input type="text" placeholder="What's next?" name="todo">
    </form>
    <ul class="todos-list"></ul>
  </div>
`;
// constants
const todoStorageKey = 'todos';
// state
let todos = JSON.parse(localStorage.getItem(todoStorageKey)) || [];

// selectors
const root = document.querySelector('.todos');
const list = root.querySelector('.todos-list');
const count = root.querySelector('.todos-count');
const clear = root.querySelector('.todos-clear');
const form = document.forms.todos;
const input = form.elements.todo;

// functions

function saveToStorage(todos){
  localStorage.setItem(todoStorageKey, JSON.stringify(todos))
}

function renderTodos(todos) {
  let todoString = '';
  todos.forEach((todo, index) => {
    todoString += `
      <li data-id="${index}"${todo.complete ? ' class="todos-complete"' : ''}>
        <input type="checkbox"${todo.complete ? ' checked' : ''}>
        <span>${todo.label}</span>
        <button type="button"></button>
      </li>
    `;
  });
  list.innerHTML = todoString;
  count.innerText = _getTypeOfTodosCount(false);
  // if there is a length show else remains hidden
  clear.style.display = _getTypeOfTodosCount() ?'block': 'none'; 
  saveToStorage(todos);
}

function addTodo(event) {
  event.preventDefault();
  const label = input.value.trim();
  const complete = false;
  todos = [
    ...todos,
    {
      label,
      complete,
    },
  ];
  renderTodos(todos);
  input.value = '';
}

function updateTodo(event) {
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const complete = event.target.checked;
  todos = todos.map((todo, index) => {
    if (index === id) {
      return {
        ...todo,
        complete,
      };
    }
    return todo;
  });
  renderTodos(todos);
}

function deleteTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'button') {
    return;
  }
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const label = event.target.previousElementSibling.innerText;
  if (window.confirm(`Delete ${label}?`)) {
    todos = todos.filter((todo, index) => index !== id);
    renderTodos(todos);
  }
}

function editTodo(capturedDBClickEvent){
  if(capturedDBClickEvent.target.nodeName.toLowerCase() !== 'span'){
    return;
  }

  const id = parseInt(capturedDBClickEvent.target.parentNode.getAttribute('data-id'), 10);
  const todoLabel = todos[id].label;

  // inner handler for input change event
  function handleEdit(changeEv){
    changeEv.stopPropagation();
    const label = this.value;

    if(this.value !== todoLabel){
      todos = todos.map((todo, index) => {
        if(index == id){
          return {
            ...todo,
            label
          };
        }
        return todo;
      });
      renderTodos(todos);
    }
    // clean up
    capturedDBClickEvent.target.hidden = false;
    this.removeEventListener('change', handleEdit);
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.value = todoLabel;
  capturedDBClickEvent.target.parentNode.append(input);
  capturedDBClickEvent.target.hidden = true; // could also style.display.none
  input.focus(); // this must be last
  // change event if not prevented will trigger other change events
  input.addEventListener('change', handleEdit);
}

function clearCompleteTodos(){
  const finishedTodos = _getTypeOfTodosCount();
  if(finishedTodos == 0){ return;} // short circuit
  if(window.confirm(`Delete ${finishedTodos} Todos?`)){
    todos = todos.filter((todo) => !todo.complete);
    renderTodos(todos);
  }

}
/** Helper to get length of either completed or non completed todos */
function _getTypeOfTodosCount(todoComplete = true){
  return todos.filter(todo => {
    return todoComplete ? todo.complete : !todo.complete;
  }).length;
}

// init
function init() {
  // initial render
  renderTodos(todos);
  // Add Todo
  form.addEventListener('submit', addTodo);
  // Update Todo
  list.addEventListener('change', updateTodo);
  // Edit Todo
  list.addEventListener('dblclick', editTodo);
  // Delete Todo
  list.addEventListener('click', deleteTodo);
  // Complete All Todos
  clear.addEventListener('click', clearCompleteTodos);
}

init();
