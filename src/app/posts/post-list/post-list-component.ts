import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

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
  userIsAuthenticated = false;
  isLoading = false;
  posts: Post[] = [];
  totalPosts = 0;
  postsPerPage = 2;
  pageSizeOptons = [1, 2, 5, 10];
  currentPage = 1;
  userId: string | undefined | null;
  private postsSub!: Subscription;
  private authListenerSubs: any;

  constructor(public postsService: PostsService, public authService: AuthService) {}

  ngOnInit(): void {
      this.isLoading = true;
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
      this.userId = this.authService.getUserId();
      this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      })
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangedPage(event: PageEvent) {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postsPerPage = event.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
};
