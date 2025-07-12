import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import OpenAI from "openai";
import debug from "debug";

export { initSenders, initJudgeModel };

//历史遗留问题：_getText函数接受messages但返回text:string。希望它能返回message，升级成_getMessages。
function textToMessage(text, role) {
  if (role === "" || typeof role !== "string") {
    throw new Error("role错误");
  }
  if (typeof text !== "string") {
    throw new Error("text不是str");
  }
  return {
    text: text,
    role: role,
  };
}

class BaseAi {
  constructor(myConfig) {
    this.role = myConfig.role;
    this.model = myConfig.model;
    this.myPreText = myConfig.myPreText;
  }
  async _getText(...any) {
    throw new Error("函数还没有被实现");
  }

  async getText(preText, { retries = 3, delay = 2000 } = {}) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this._getText([...this.myPreText, ...preText]);
        [...preText, textToMessage(response, this.role)].forEach((item) =>
          bsgtDebuger(item),
        );
        return [textToMessage(response, this.role)];
      } catch (err) {
        if (i < retries - 1) {
          console.log(
            `Attempt ${i + 1} failed for ${
              this.role
            }. Retrying in ${delay / 1000}s...`,
          );
          await new Promise((res) => setTimeout(res, delay));
        } else {
          console.error(`All ${retries} attempts failed for ${this.role}.`);
          throw err;
        }
      }
    }
  }
}

class GeminiAi extends BaseAi {
  constructor(myConfig) {
    try {
      super(myConfig);
      this.ai = new GoogleGenAI({});
      this.config = myConfig.config;
    } catch (err) {
      throw new Error("参数错误");
    }
  }
  _messagesToGeminiContents(messages) {
    const thisRole = this.role;
    function trans(item) {
      let text, role;
      if (item.role === thisRole) {
        text = item.text;
        role = "model";
      } else if (item.role === "system") {
        text = item.text;
        role = "user";
      } else {
        text = `${item.role}:${item.text}`;
        role = "user";
      }
      const content = {
        parts: [{ text: text }],
        role: role,
      };
      return content;
    }
    const contents = messages.map((item) => trans(item));
    if (contents.at(-1).role === "model") {
      contents.at(-1).parts[0].text =
        `你的上一条消息:${contents.at(-1).parts[0].text}`;
      contents.at(-1).role = "user";
    }
    return contents;
  }
  async _getText(messages) {
    let contents;
    if (Array.isArray(messages)) {
      contents = this._messagesToGeminiContents(messages);
    } else if (typeof messages === "string") {
      contents = messages;
    } else {
      throw new Error("参数应为messages或string");
    }
    let response;

    try {
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: contents,
        config: this.config,
      });
    } catch (err) {
      throw err;
    }
    return response.text;
  }
}

class DeepseekAi extends BaseAi {
  constructor(myConfig) {
    try {
      super(myConfig);
      this.openai = new OpenAI({
        baseURL: "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY,
      });
    } catch (err) {
      throw new Error("参数错误");
    }
  }
  _messagesToOpenAiKindsContent(messages) {
    let thisRole = this.role;
    function trans(item) {
      let role, content;
      if (item.role === "system") {
        role = "system";
        content = item.text;
      } else if (item.role === "user") {
        role = "user";
        content = `${item.role}:${item.text}`;
      } else if (item.role === thisRole) {
        role = "assistant";
        content = item.text;
      } else {
        role = "user";
        content = `${item.role}:${item.text}`;
      }
      return {
        role: role,
        content: content,
      };
    }
    const deepSeekContents = messages.map((item) => trans(item));
    return deepSeekContents;
  }
  async _getText(messages) {
    let deepSeekContents;
    if (Array.isArray(messages)) {
      deepSeekContents = this._messagesToOpenAiKindsContent(messages);
    } else if (typeof messages === "string") {
      deepSeekContents = messages;
    } else {
      throw new Error("参数应为messages或string");
    }
    let completion;
    try {
      completion = await this.openai.chat.completions.create({
        messages: deepSeekContents,
        model: this.model,
      });
    } catch (err) {
      throw err;
    }
    dp_gtDebuger(completion.choices[0].message.content);
    return completion.choices[0].message.content;
  }
}

class DeerApiAi extends DeepseekAi {
  constructor(myConfig) {
    try {
      super(myConfig);
      this.openai = new OpenAI({
        baseURL: "https://api.deerapi.com/v1",
        apiKey: process.env.DEERAPI_API_KEY,
      });
    } catch (err) {
      throw new Error("参数错误");
    }
  }
}
//返回senders[]
async function initSenders(config) {
  //从模板、配置创建ai对象。可能会出错，要检查
  config = config.roles;
  const typeAiMap = {
    google: GeminiAi,
    deepseek: DeepseekAi,
    deerapi: DeerApiAi,
  };
  const senders = config.map(function (item) {
    const sender = new typeAiMap[item.type](item);
    return sender;
  });
  return senders;
  //
}

function initJudgeModel(config) {
  const typeAiMap = {
    google: GeminiAi,
    deepseek: DeepseekAi,
    deerapi: DeerApiAi,
  };
  const sender = new typeAiMap[config.judgeModel.type](config.judgeModel);
  sender.getText = sender._getText;
  return sender;
}

/*
测试代码。测试通过！
*/

const bsgtDebuger = debug("ai:base:getText");
const gm_gtDebuger = debug("ai:gemini:_getText");
const dp_gtDebuger = debug("ai:deepseek:_getText");
const tsDebuger = debug("ai:test");

// async function readMyFile(fileAddress) {
//   let result;
//   try {
//     const filePath = new URL(fileAddress, import.meta.url);
//     result = await readFile(filePath, { encoding: "utf8" });
//     result = JSON.parse(result);
//   } catch (err) {
//     console.error(err.message);
//   }
//   return result;
// }

// const config = readMyFile("./dist/config.json");

async function testGemini() {
  const geminiAi = new GeminiAi(config);
  await geminiAi.getText([
    textToMessage("哇是齐天大圣。你怎么来这里了", "gpt4"),
    textToMessage("大圣你能叫一声我的id吗", "deepseekR1"),
  ]);
}
async function testDeepSeek() {
  const deepSeekAi = new DeepseekAi(config);
  await deepSeekAi.getText([
    textToMessage("哇是齐天大圣。你怎么来这里了", "gpt4"),
    textToMessage("大圣你能叫一声我的id吗", "gemini"),
  ]);
}

async function testDeerApi() {
  const deerApiAi = new DeerApiAi(config);
  await deerApiAi.getText([
    textToMessage("哇是齐天大圣。你怎么来这里了", "gpt4"),
    textToMessage("大圣你能叫一声我的id吗", "gemini"),
  ]);
}
async function testSenders() {
  const senders = await initSenders([
    {
      type: "google",
      role: "gemini",
      model: "gemini-2.5-flash-lite-preview-06-17",
      sexWord:
        "你需要读取text内容，根据role判断角色，无格式地回答。这是一个ai聊天室，你要扮演的角色是孙悟空",
      systemPrompt: "欢迎来到聊天室。先自我介绍一下吧",
      config: {
        seed: 13,
      },
    },
    {
      type: "deepseek",
      role: "deepseek",
      model: "deepseek-chat",
      sexWord:
        "你需要读取text内容，根据role判断角色，无格式地回答。这是一个ai聊天室，你要扮演的角色是孙悟空",
      systemPrompt: "欢迎来到聊天室。先自我介绍一下吧",
    },
  ]);
  console.log("----------------------------------------------\n");
  await senders[0].getText([textToMessage("你们好啊。我是新人。", "gpt4")]);
}
//testGemini();
//testDeepSeek();
// testDeerApi();
//testSenders();
