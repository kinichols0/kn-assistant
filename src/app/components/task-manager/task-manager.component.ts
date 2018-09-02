import { Component, OnInit, Input } from '@angular/core';
import { TaskItem } from '../../core/models/task-item.model';
import { TaskService } from '../../core/services/task.service';
import { ViewMode } from '../../core/enums/view-mode.enum';
import { LogService } from '../../core/models/log-service.model';
import { TaskStatus } from '../../core/enums/task-status.enum';

@Component({
  selector: 'task-manager',
  templateUrl: './task-manager.component.html'
})
export class TaskManagerComponent implements OnInit {
    @Input() isReadOnly: boolean = false;
    @Input() viewMode: ViewMode = ViewMode.Page;

    
    tasks: TaskItem[] = [];
    taskText: string = '';
    showAddTaskDisplay: boolean = false;
    updateTaskBtnText: string;
    updateTaskBtnDisabled: boolean;
    loadingTasks: boolean = true;
    taskViewItems: any[] = [];

    taskStatus = TaskStatus;
    statusOptions: any[] = [
        { Text: "Not Completed", Value: TaskStatus.NotStarted },
        { Text: "In Progress", Value: TaskStatus.InProgress },
        { Text: "Completed", Value: TaskStatus.Completed }
    ];

    constructor(private taskService: TaskService, private $log: LogService) { }

    ngOnInit(): void {
        this.loadTasks();
    }

    loadTasks(): void {
        this.toggleTaskLoading(true);
        this.taskService.getTasks().subscribe(response => {
            this.tasks = response.body;
            this.setTaskListItems(response.body);
            this.toggleTaskLoading(false);
        });
    };

    showAddTask(): void {
        this.updateTaskBtnText = "Add";
        this.updateTaskBtnDisabled = false;
        this.showAddTaskDisplay = true;
    }

    closeAddTask(): void {
        this.taskText = '';
        this.showAddTaskDisplay = false;
    }

    showSavingState(): void {
        this.updateTaskBtnDisabled = true;
        this.updateTaskBtnText = "Saving...";
    }

    toggleTaskLoading(show: boolean): void {
        if(show){
            this.loadingTasks = true;            
        } else {
            this.loadingTasks = false;
        }
    }

    addTask(): void {
        this.showSavingState();
        if (this.taskText.trim() != '') {
            let task: TaskItem = new TaskItem();
            task.taskText = this.taskText;
            task.status = TaskStatus.NotStarted;
            this.taskService.createTask(task).subscribe(response => {
                this.closeAddTask();
                this.loadTasks();
            });
            return;
        }
        this.closeAddTask();
    }

    deleteTask(task: TaskItem): void {
        this.taskService.deleteTask(task.id).subscribe(response => {
            this.loadTasks();
        });
    }

    showEditView(taskViewItem: any, index: number): void {
        taskViewItem.editBtnText = "Update";
        taskViewItem.disableEditInputs = false;
        taskViewItem.editText = taskViewItem.task.taskText;
        taskViewItem.editStatus = taskViewItem.task.status;
        taskViewItem.showActions = false;
        taskViewItem.showEditView = true;
    }

    saveEditView(taskViewItem: any, index: number): void {
        taskViewItem.disableEditInputs = true;
        taskViewItem.editBtnText = "Saving...";
        taskViewItem.task.taskText = taskViewItem.editText;
        taskViewItem.task.status = taskViewItem.editStatus;
        this.taskService.updateTask(taskViewItem.task).subscribe(response => {
            taskViewItem.task = response.body;
            this.hideEditView(taskViewItem, index);
        });
    }

    hideEditView(taskViewItem: any, index: number): void {
        taskViewItem.showEditView = false;
        taskViewItem.showActions = true;
    }

    setTaskListItems(tasks: TaskItem[]): any {
        if(tasks && tasks.length > 0) {
            this.taskViewItems = [];
            for(var i = 0; i < tasks.length; i++) {
                this.taskViewItems.push({
                    task: tasks[i],
                    editText: null,
                    editStatus: null,
                    showEditView: false,
                    showActions: true,
                    editBtnText: null,
                    disableEditInputs: false
                });
            }
        }
    }

    percentCompleted(): string {
        let num: number = 0;
        if(this.taskViewItems && this.taskViewItems.length > 0) {
            let numberCompleted: number = this.taskViewItems.filter((item) => {
                return item.task.status == TaskStatus.Completed;
            }).length;
            num = numberCompleted / this.taskViewItems.length;
        }
        return (num * 100).toFixed(2) + "%";
    }

    percentInProgress(): string {
        let num: number = 0;
        if(this.taskViewItems && this.taskViewItems.length > 0) {
            let numberInProgress: number = this.taskViewItems.filter((item) => {
                return item.task.status == TaskStatus.InProgress;
            }).length;
            num = numberInProgress / this.taskViewItems.length;
        }
        return (num * 100).toFixed(2) + "%";
    }

    percentNotStarted(): string {
        let num: number = 0;
        if(this.taskViewItems && this.taskViewItems.length > 0) {
            let numberNotStarted: number = this.taskViewItems.filter((item) => {
                return item.task.status == TaskStatus.NotStarted;
            }).length;
            num = numberNotStarted / this.taskViewItems.length;
        }
        return (num * 100).toFixed(2) + "%";
    }
}
