# AI Chat Party

一个简单的命令行多 AI 聊天室。

该项目允许在同一个对话中集成多个 AI 模型作为聊天角色。它使用一个独立的、轻量级的 AI 模型来分析对话历史，并决定下一个发言的角色，从而实现自动化的多角色对话流程。

## 使用方法

```bash
# 安装依赖
yarn install 

# 运行程序
yarn node index.js
```

## 配置文件

-   `dist/config.json`: 用于定义聊天角色和判断模型的信息。
-   `dist/preText.json`: 用于存储和读取历史对话记录。
