package com.freepulse.freepulse.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;           // 標題

    @Column(columnDefinition = "TEXT")
    private String content;         // 純文字內容

    @Column(columnDefinition = "LONGTEXT")
    private String bodyHTML;        // 富文本 HTML 內容

    private String category;        // 分類
    private String tags;            // 標籤（逗號分隔）
    private String authorName;      // 作者名
    private String authorEmail;     // 作者 Email（用於權限判斷）
    private String authorLocation;  // 旅居地點
    private String createdDate;     // 發表日期
    private int views;              // 瀏覽數
    private int likes;              // 按讚數

    // ── Getters & Setters ──

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getBodyHTML() { return bodyHTML; }
    public void setBodyHTML(String bodyHTML) { this.bodyHTML = bodyHTML; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getAuthorLocation() { return authorLocation; }
    public void setAuthorLocation(String authorLocation) { this.authorLocation = authorLocation; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public int getViews() { return views; }
    public void setViews(int views) { this.views = views; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
}
