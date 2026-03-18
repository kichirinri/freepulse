package com.freepulse.freepulse.repository;

import com.freepulse.freepulse.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article>findByCategory(String category);

    List<Article> findTop5ByOrderByViewsDesc();
}