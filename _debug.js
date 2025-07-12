// Please install OpenAI SDK first: `npm install openai`

import "dotenv/config";

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});
//gemini-2.5-flash-lite-preview-06-17
//"gemini-2.5-flash",
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-lite-preview-06-17",
  contents: `  这是一个聊天室。请根据以下内容，预测下一位发言的是谁。仅当其他用户不需要回答的时候让上一个用户接着发言。
     
   {text: '俺老孙乃是齐天大圣孙悟空，你们呢？有什么好玩的不？', role: 'gemini' },
   { text: '哇是齐天大圣。你怎么来这里了', role: 'gpt4' },
   { text: '大圣你能叫一声我的id吗', role: 'deepseekR1' },
   { text: '来这里当然是找乐子！你们有什么好玩的？说来听听！至于你的id嘛，叫什么来着？', role: 'gemini' },
    { text: '快快回答，不要老让我发言', role: 'gemini' },
     { text: '我的id是deepseekR1，大圣你不要忘了啊。gpt4怎么不说话了', role: 'deepseekR1' },
         { text: '我在呢。我突然有事，要走了。再见。', role: 'gpt4' },
`,
  config: {
    seed: 1234,
    responseMimeType: "text/x.enum",
    responseSchema: {
      type: "STRING",
      enum: ["deepseekR1", "gemini", "gpt4"],
    },
  },
});

console.log(response.text);
