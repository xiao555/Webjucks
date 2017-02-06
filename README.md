## Webjucks

### 项目结构

```bash
- web
  - build                    # 打包生成的
  - src           
    - assets                 # 其他资源
      - images             
      - fonts 
    - scripts
      - index.js             # 入口文件 
    - styles
      - styles               #css
      - stylus
        - *.styl         
        - variables.styl     # 全局变量  
    - index.js               # 入口文件
  - views 
    - base.html              # 模板
    - includes               # 引用的模块
      - header.html
      - footer.html  
  - webpack.config.js        # webpack配置文件
```

### 使用

```javascript
npm install
npm start
```


