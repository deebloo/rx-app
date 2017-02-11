import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/takeUntil';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';




// Define Manager and actions
class ToDo {
  constructor(public title: string, public completed = false) { }
}

const manager = new BehaviorSubject<ToDo[]>([]);

manager.next([
  new ToDo('Get Milk'),
  new ToDo('Workout')
]);

const actions = manager => {
  return (fn) => {
    return manager
      .first()
      .do(todos => manager.next(fn(todos)));
  }
}

const addTodo = (manager, todo: ToDo) => {
  return actions(manager)(todos => [...todos, todo]);
}

const removeTodo = (manager, index: number) => {
  return actions(manager)(todos => todos.filter((item, i) => i !== index));
}




// Define Todo element
class TodoList extends HTMLElement {
  todos: Observable<ToDo[]>;

  private unsubscriber = new Subject();
  private list: HTMLUListElement = document.createElement('ul');

  connectedCallback() {
    this.appendChild(this.list);

    this.todos
      .takeUntil(this.unsubscriber)
      .subscribe(this.updateList.bind(this));
  }

  disconnectedCallback() {
    this.unsubscriber.next();
  }

  createTodoItem(item, id) {
    const li = document.createElement('li');
    li.textContent = item.title;

    const button = this.createTodoButton(id);

    li.appendChild(button);

    this.list.appendChild(li);
  }

  private createTodoButton(id) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = 'X';
    button.onclick = e => {
      removeTodo(this.todos, parseInt(e.target['id'], 10)).subscribe();
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

const TodoListEl = window['customElements'].define('todo-list', TodoList);




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

  addTodo(manager, new ToDo(value)).subscribe(res => {
    console.log(value + ' added');

    input['value'] = '';
  });
}