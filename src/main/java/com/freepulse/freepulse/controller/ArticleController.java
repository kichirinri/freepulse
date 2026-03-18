package com.freepulse.freepulse.controller;

import com.freepulse.freepulse.entity.Article;
import com.freepulse.freepulse.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    // 取得所有文章
    @GetMapping
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    // 按分類查詢
    @GetMapping("/category/{category}")
    public List<Article> getByCategory(@PathVariable String category) {
        return articleService.getByCategory(category);
    }

    // 熱門文章
    @GetMapping("/hot")
    public List<Article> getHotArticles() {
        return articleService.getHotArticles();
    }

    // 發表文章
    @PostMapping
    public Article createArticle(@RequestBody Article article) {
        return articleService.createArticle(article);
    }

    // 刪除文章
    @DeleteMapping("/{id}")
    public void deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
    }

    // 增加瀏覽數
    @PostMapping("/{id}/view")
    public void addView(@PathVariable Long id) {
        articleService.addView(id);
    }

    // 打賞
    @PostMapping("/{id}/like")
    public Article addLike(@PathVariable Long id) {
        return articleService.addLike(id);
    }

    // 更新文章
    @PutMapping("/{id}")
    public Article updateArticle(@PathVariable Long id, @RequestBody Article article) {
        return articleService.updateArticle(id, article);
    }
}