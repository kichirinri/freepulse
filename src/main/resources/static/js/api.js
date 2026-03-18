/* ============================================================
   api.js — 所有與後端的通信 文薈 WenHui
   ============================================================ */

const API = {
  async getArticles() {
    const res = await fetch('/api/articles');
    return await res.json();
  },
  async getHotArticles() {
    const res = await fetch('/api/articles/hot');
    return await res.json();
  },
  async getByCategory(category) {
    const res = await fetch(`/api/articles/category/${encodeURIComponent(category)}`);
    return await res.json();
  },
  async createArticle(data) {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  async deleteArticle(id) {
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
  },
  async addView(id) {
    await fetch(`/api/articles/${id}/view`, { method: 'POST' });
  },
  async addLike(id) {
    const res = await fetch(`/api/articles/${id}/like`, { method: 'POST' });
    return await res.json();
  }
};
