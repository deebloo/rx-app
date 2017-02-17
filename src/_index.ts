import { BehaviorSubject } from 'rxjs';

const manager = new BehaviorSubject(['Get Milk', 'Work out']);

const action = (manager, fn) => {
  return manager
    .first()
    .do(todos => manager.next(fn(todos)));
}

const addTodoAction = (manager, todo: string) => {
  return action(manager, todos => [...todos, todo]);
}

const removeTodoAction = (manager, index: number) => {
  return action(manager, todos => {
    return todos.filter((item, i) => i !== index)
  });
}





// Define Todo element
class TodoList extends HTMLElement {
  // The Input accepts an observables that results in a string array
  todos;

  // we create a ul element
  private list: HTMLUListElement = document.createElement('ul');

  connectedCallback() {
    // when element is connected
    this.appendChild(this.list);

    // subscribe to the observable of todos that was passed in
    this.todos.subscribe(this.updateList.bind(this));
  }

  // call the remove todo action
  removeTodo(id) {
    return removeTodoAction(this.todos, id).subscribe();
  }

  // Dom creation stuff
  private createTodoItem(item, id) {
    const li = document.createElement('li');
    const text = document.createTextNode(item);
    const button = this.createTodoButton(id);

    li.appendChild(button);
    li.appendChild(text);

    this.list.appendChild(li);
  }

  // dom creation stuff
  private createTodoButton(id) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = 'X';
    button.onclick = e => {
      this.removeTodo(parseInt(e.target['id'], 10));
    };

    return button;
  }

  private updateList(res) {
    while (this.list.firstChild) {
      this.list.removeChild(this.list.firstChild);
    }

    res.forEach((item, index) => this.createTodoItem(item, index));
  }
}

window['customElements'].define('todo-list', TodoList);





// Create instance of list and add to body
const myList1 = document.createElement('todo-list') as TodoList;
myList1.todos = manager;

const myList2 = document.createElement('todo-list') as TodoList;
myList2.todos = manager;

document.body.appendChild(myList1);
document.body.appendChild(document.createElement('hr'));
document.body.appendChild(myList2);





// Add new todos
const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');

form.onsubmit = e => {
  e.preventDefault();
  const value = input['value'];

  addTodoAction(manager, value).subscribe(res => {
    input['value'] = '';
  });
}