package com.freepulse.freepulse.entity;

import jakarta.persistence.*;

    @Entity
    @Table(name = "articles")
    public class Article {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String title;        // 標題

        @Column(columnDefinition = "TEXT")
        private String content;      // 內容

        private String category;     // 分類
        private String authorName;   // 作者名
        private String authorLocation; // 旅居地點
        private String createdDate;  // 發表日期
        private int views;           // 瀏覽數
        private int likes;           // 按讚數
        private int comments;        // 評論數
        public int getComments() {
            return comments;
        }

        public void setComments(int comments) {
            this.comments = comments;
        }

        public int getLikes() {
            return likes;
        }

        public void setLikes(int likes) {
            this.likes = likes;
        }

        public int getViews() {
            return views;
        }

        public void setViews(int views) {
            this.views = views;
        }

        public String getCreatedDate() {
            return createdDate;
        }

        public void setCreatedDate(String createdDate) {
            this.createdDate = createdDate;
        }

        public String getAuthorLocation() {
            return authorLocation;
        }

        public void setAuthorLocation(String authorLocation) {
            this.authorLocation = authorLocation;
        }

        public String getAuthorName() {
            return authorName;
        }

        public void setAuthorName(String authorName) {
            this.authorName = authorName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }



        // Getter和Setter → Alt+Insert → Getter and Setter
    }

