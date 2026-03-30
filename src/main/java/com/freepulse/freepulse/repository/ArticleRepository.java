package com.freepulse.freepulse.repository;

import com.freepulse.freepulse.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    // 按分類查詢
    List<Article> findByCategory(String category);

    // 按作者 Email 查詢（我的文章）
    List<Article> findByAuthorEmailOrderByCreatedDateDesc(String authorEmail);

    // 所有文章按時間倒序
    List<Article> findAllByOrderByCreatedDateDesc();

    // 熱門文章（按讚數）
    List<Article> findTop10ByOrderByLikesDesc();

    // 搜尋（標題或內容包含關鍵字）
    List<Article> findByTitleContainingOrContentContaining(String title, String content);
}
