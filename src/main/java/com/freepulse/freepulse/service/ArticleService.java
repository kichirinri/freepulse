package com.freepulse.freepulse.service;

import com.freepulse.freepulse.entity.Article;
import com.freepulse.freepulse.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    // 取得所有文章（按時間倒序）
    public List<Article> getAllArticles() {
        return articleRepository.findAllByOrderByCreatedDateDesc();
    }

    // 按分類查詢
    public List<Article> getByCategory(String category) {
        return articleRepository.findByCategory(category);
    }

    // 熱門文章（按點讚數）
    public List<Article> getHotArticles() {
        return articleRepository.findTop10ByOrderByLikesDesc();
    }

    // 取得單篇文章
    public Article getById(Long id) {
        return articleRepository.findById(id).orElse(null);
    }

    // 取得某作者的文章
    public List<Article> getByAuthorEmail(String email) {
        return articleRepository.findByAuthorEmailOrderByCreatedDateDesc(email);
    }

    // 發表文章
    public Article createArticle(Article article) {
        // 自動設定發表時間
        String now = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        article.setCreatedDate(now);
        article.setViews(0);
        article.setLikes(0);
        return articleRepository.save(article);
    }

    // 更新文章
    public Article updateArticle(Long id, Article updated) {
        return articleRepository.findById(id).map(article -> {
            article.setTitle(updated.getTitle());
            article.setContent(updated.getContent());
            article.setBodyHTML(updated.getBodyHTML());
            article.setCategory(updated.getCategory());
            article.setTags(updated.getTags());
            return articleRepository.save(article);
        }).orElse(null);
    }

    // 刪除文章
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    // 增加瀏覽數
    public void addView(Long id) {
        articleRepository.findById(id).ifPresent(article -> {
            article.setViews(article.getViews() + 1);
            articleRepository.save(article);
        });
    }

    // 按讚
    public Article addLike(Long id) {
        return articleRepository.findById(id).map(article -> {
            article.setLikes(article.getLikes() + 1);
            return articleRepository.save(article);
        }).orElse(null);
    }

    public List<Article> getByAuthorName(String name) {
        return articleRepository.findByAuthorName(name);
    }

    // 搜尋
    public List<Article> search(String keyword) {
        return articleRepository.findByTitleContainingOrContentContainingOrAuthorNameContaining(keyword, keyword, keyword);
    }

    public List<Article> getCategoryLatest(String category, int limit) {
        return articleRepository.findByCategoryOrderByCreatedDateDesc(category)
                .stream().limit(limit).collect(java.util.stream.Collectors.toList());
    }
}

