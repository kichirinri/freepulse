package com.freepulse.freepulse.service;

import com.freepulse.freepulse.entity.Article;
import com.freepulse.freepulse.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    // 取得所有文章
    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    // 按分類查詢
    public List<Article> getByCategory(String category) {
        return articleRepository.findByCategory(category);
    }

    // 熱門文章
    public List<Article> getHotArticles() {
        return articleRepository.findTop5ByOrderByViewsDesc();
    }

    // 發表文章
    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    // 刪除文章
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    // 增加瀏覽數
    public void addView(Long id) {
        articleRepository.findById(id).ifPresent(a -> {
            a.setViews(a.getViews() + 1);
            articleRepository.save(a);
        });
    }

    // 打賞（增加讚數）
    public Article addLike(Long id) {
        return articleRepository.findById(id).map(a -> {
            a.setLikes(a.getLikes() + 1);
            return articleRepository.save(a);
        }).orElse(null);
    }

    // 更新文章
    public Article updateArticle(Long id, Article article) {
        article.setId(id);
        return articleRepository.save(article);
    }
}