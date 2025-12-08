<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          Генератор цветовых палитр
        </router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            Генератор
          </router-link>
          <router-link to="/library" class="nav-link">
            Библиотека
          </router-link>
          <router-link to="/analysis" class="nav-link">
            Анализ
          </router-link>
          <router-link to="/export" class="nav-link">
            Экспорт
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view :key="$route.fullPath" />
    </main>
    
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-info">
          <p class="copyright">Vue App</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --bg-primary: #fff;
  --bg-secondary: #fafafa;
  --text-primary: #000;
  --text-secondary: #666;
  --accent-primary: #000;
  --accent-secondary: #333;
  --border-color: #e0e0e0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-nav {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand {
  text-decoration: none;
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 400;
  padding: 8px 0;
  position: relative;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.router-link-active {
  color: var(--text-primary);
  font-weight: 500;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--text-primary);
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.main-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 30px 20px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-info h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
}

.footer-info p {
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 13px;
}

.copyright {
  margin-top: 20px;
  font-size: 12px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px 0;
  }
  
  .nav-links {
    margin: 20px 0;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }
  
  .main-content {
    padding: 15px;
  }
}
</style>