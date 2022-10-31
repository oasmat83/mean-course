import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";

import { Post } from '../post.model';
import { PostsService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list-component.html',
  styleUrls:['./post-list-component.scss']
})



export class PostListComponent implements OnInit, OnDestroy {

  // posts = [
  //   { title: "First Post", content: "This is the first post's content" },
  //   { title: "Second Post", content: "This is the second post's content" },
  //   { title: "Third Post", content: "This is the third post's content" }
  // ]
  isLoading = false;
  posts: Post[] = [];
  totalPosts = 10;
  postsPerPage = 2;
  pageSizeOptons = [1, 2, 5, 10]
  private postsSub!: Subscription;

  constructor(public postsService: PostsService) {}

  ngOnInit(): void {
      this.isLoading = true;
      this.postsService.getPosts();
      this.postsSub = this.postsService.getPostUpdateListener().subscribe((posts: Post[]) => {
        this.isLoading = false;
        this.posts = posts;
      })
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  onChangedPage(event: PageEvent) {
    console.log(event)
  }
};
