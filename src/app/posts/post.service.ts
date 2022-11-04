import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

//injecting Service to Root (app.module.ts)
@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{
      message: string,
      posts: any,
      maxPosts: number
    }>('http://24.190.226.10/api/posts' + queryParams)
    .pipe(map((postData) => {
      return { posts: postData.posts.map((post:any) => {
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imagePath,
          creator: post.creator
        }
      }),
      maxPosts: postData.maxPosts
    }
    }))
    .subscribe((transformedPostData) => {
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
    });
    // return [...this.posts];
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    // const post: Post = { title, content, id: '' };
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{
      message: string,
      post: Post
    }>('http://24.190.226.10/api/posts', postData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      });
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>("http://24.190.226.10/api/posts/" + id);
  }

  deletePost(postId: string) {
    return this.http.delete("http://24.190.226.10/api/posts/" + postId);
  }

  updatePost(id: string, title:string, content: string, image: File | string) {
    let postData;
    if (typeof(image) === "object") {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      }
    }

    this.http.put<{
      message: string,
      postId: string
    }>('http://24.190.226.10/api/posts/' + id, postData)
    .subscribe((response) => {
      this.router.navigate(["/"]);
    });
  }
}
