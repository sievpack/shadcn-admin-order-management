浏览器 localStorage 中还有旧的 token。需要清除：
1. 打开浏览器开发者工具 (F12)
2. Application → Local Storage → http://localhost:5173
3. 删除 token 和 userInfo
或者在浏览器控制台执行：
localStorage.removeItem('token'); localStorage.removeItem('userInfo'); location.reload();
然后刷新页面即可看到登录页。