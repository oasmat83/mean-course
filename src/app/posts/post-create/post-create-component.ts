import { NgFor } from "@angular/common";
import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { PostsService } from '../post.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create-component.html',
  styleUrls: ['./post-create-component.scss']
})

export class PostCreateComponent {
  enteredContent = "";
  enteredTitle = "";

  constructor(public postsService: PostsService) {}

  onAddPost(form: NgForm) {
    if (form.invalid) return;
    this.postsService.addPost(form.value.title, form.value.content)
  }

}
