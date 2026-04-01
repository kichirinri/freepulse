package com.freepulse.freepulse.controller;

import com.freepulse.freepulse.entity.Article;
import com.freepulse.freepulse.service.ArticleService;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.resolver.font.DefaultFontProvider;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.font.FontProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;


@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*")
public class ArticleController {

    @Autowired
    private ArticleService articleService;


    @GetMapping("/{id}/pdf")
    public void downloadPdf(@PathVariable Long id,
                            @RequestParam(defaultValue = "true") boolean watermark,
                            HttpServletResponse response) throws Exception {
        Article article = articleService.getById(id);
        if (article == null) { response.setStatus(404); return; }

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"article_" + article.getId() + ".pdf\"");

        // 先生成 PDF 到 ByteArrayOutputStream
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        ConverterProperties properties = new ConverterProperties();
        FontProvider fontProvider = new DefaultFontProvider(false, false, false);
        fontProvider.addDirectory("C:/Windows/Fonts");
        properties.setFontProvider(fontProvider);

        String wmHtml = watermark
                ? "<div style='margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#aaa;'>© "
                  + article.getAuthorName() + " · Scribe · " + location(article) + "</div>"
                : "";

        String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'/>" +
                "<style>body{font-family:'Microsoft YaHei',Arial,sans-serif;padding:40px;line-height:1.8;}" +
                "h1{font-size:24px;} .meta{color:#888;font-size:13px;margin-bottom:20px;}" +
                "hr{border:none;border-top:1px solid #ddd;margin:20px 0;}" +
                "</style></head><body>" +
                "<h1>" + article.getTitle() + "</h1>" +
                "<div class='meta'>" + article.getCategory() + " · " + article.getAuthorName() + " · " + article.getCreatedDate() + "</div>" +
                "<hr/>" +
                (article.getBodyHTML() != null ? article.getBodyHTML() : article.getContent().replace("\n","<br/>")) +
                wmHtml +
                "</body></html>";

        HtmlConverter.convertToPdf(html, baos, properties);

        // 加密 + 禁止复制
        byte[] pdfBytes = baos.toByteArray();
        PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));

        WriterProperties writerProps = new WriterProperties()
                .setStandardEncryption(
                        null,                          // 用户密码（无需密码即可打开）
                        "scribe2026".getBytes(),       // 所有者密码
                        EncryptionConstants.ALLOW_PRINTING,  // 只允许打印
                        EncryptionConstants.ENCRYPTION_AES_256
                );

        PdfWriter writer = new PdfWriter(response.getOutputStream(), writerProps);
        PdfDocument pdfDoc = new PdfDocument(reader, writer);
        // 加背景水印（多行重复铺满整页）
        if (watermark) {
            int pages = pdfDoc.getNumberOfPages();
            PdfFont wmFont = PdfFontFactory.createFont("C:/Windows/Fonts/msyh.ttc,0",
                    PdfEncodings.IDENTITY_H);

            for (int i = 1; i <= pages; i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfCanvas canvas = new PdfCanvas(page.newContentStreamBefore(),
                        page.getResources(), pdfDoc);
                Rectangle pageSize = page.getPageSize();

                canvas.saveState();
                PdfExtGState gs = new PdfExtGState();
                gs.setFillOpacity(0.12f);
                canvas.setExtGState(gs);

                String wmText = "Scribe  " + article.getAuthorName() + "  版權所有";
                float angle = (float)(Math.PI / 6); // 30度
                float cos = (float) Math.cos(angle);
                float sin = (float) Math.sin(angle);

                // 铺满整页，横向间距180，纵向间距100
                for (float y = -200; y < pageSize.getHeight() + 300; y += 100) {
                    for (float x = -200; x < pageSize.getWidth() + 300; x += 180) {
                        canvas.beginText()
                                .setFontAndSize(wmFont, 14)
                                .setColor(new DeviceRgb(30, 60, 120), true)
                                .setTextMatrix(cos, sin, -sin, cos, x, y)
                                .showText(wmText)
                                .endText();
                    }
                }
                canvas.restoreState();
            }
        }
        pdfDoc.close();
    }

    private String location(Article article) {
        return "localhost:8080/article.html?id=" + article.getId();
    }

    // 取得所有文章
    @GetMapping
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    // 取得單篇文章
    @GetMapping("/{id}")
    public Article getById(@PathVariable Long id) {
        return articleService.getById(id);
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

    // 我的文章（按作者 Email）
    @GetMapping("/my/{email}")
    public List<Article> getMyArticles(@PathVariable String email) {
        return articleService.getByAuthorEmail(email);
    }

    // 搜尋
    @GetMapping("/search")
    public List<Article> search(@RequestParam String keyword) {
        return articleService.search(keyword);
    }

    // 發表文章
    @PostMapping
    public Article createArticle(@RequestBody Article article) {
        return articleService.createArticle(article);
    }

    // 更新文章
    @PutMapping("/{id}")
    public Article updateArticle(@PathVariable Long id, @RequestBody Article article) {
        return articleService.updateArticle(id, article);
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

    // 按讚
    @PostMapping("/{id}/like")
    public Article addLike(@PathVariable Long id) {
        return articleService.addLike(id);
    }
}
