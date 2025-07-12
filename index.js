// ai应用需求：
// 命令行 -因为简单
// 同一对话中包含多个模型
//  - while(true){小模型判断id（输入pre输出sender）、更新curmessa（用户输入或核心函数gettext，输入pre输出cur）,显示，按格式更新pre，log}

// import * as readline from "node:readline/promises";
// import { stdin as input, stdout as output } from "node:process";

// async function main() {
//   //初始化

//   const rl = readline.createInterface({
//     input,
//     output,
//     prompt: ">",
//   });
//   console.log('my ai chat app');
//   rl.prompt(true);
//   for await(const line of rl){

//   }
// }

/*
todo:
模型的结构化输出-输出更稳定
使用blessed或者ink（与react类似，可以借机学习react）构建命令行应用（类似vim那种全屏的）
更改坡仙次输入方式为messages。然后去掉init。✔
*/

import { json } from "node:stream/consumers";
import { initSenders, initJudgeModel } from "./src/senders.js";
import { readFile } from "node:fs/promises";
import chalk from "chalk";

async function whoWillSend(preText, model) {
  let senderName = model.getText(
    `这是一个聊天室。请根据以下内容，预测下一位发言的是谁。仅当其他用户不需要回答的时候让上一个用户接着发言。\n${JSON.stringify(preText)}`,
  );
  return senderName;
}
//获取senderText,构成curMessage。采用senders[senderName].getText
async function getSenderMessage(senders, senderName, preText) {
  let senderMessage;
  let sender = senders.find((item) => item.role === senderName);
  if (senderName === "user") {
    let userInput = prompt();
    if (userInput === "exit") {
      console.log("拜拜");
      //程序停止
      return "exit";
    } else {
      senderMessage = prompt();
    }
  } else {
    senderMessage = await sender.getText(preText);
  }
  return senderMessage;
}
function show(curMessage) {
  curMessage = console.log(
    chalk.red.bold(`${curMessage[0].role}`) +
      `:` +
      `${curMessage[0].text}` +
      `\n` +
      `----------------------------`,
  );
}
function updatePre(preText, curMessage) {
  preText = [...preText, ...curMessage];
  return preText;
}
function log(preText, preTextAddress) {
  return senders;
}
async function readMyFile(fileAddress) {
  let result;
  try {
    const filePath = new URL(fileAddress, import.meta.url);
    result = await readFile(filePath, { encoding: "utf8" });
    result = JSON.parse(result);
  } catch (err) {
    console.error(err.message);
  }
  return result;
}
async function main(configAddress, preTextAddress) {
  //从文件读取preText和config
  // checkPreText();
  // checkConfig();
  let preText = await readMyFile(preTextAddress);
  let config = await readMyFile(configAddress);
  //从文件读取config来初始化senders。senders是一个数组，储存了各个ai/用户对象，每个对象中都有相应的的方法
  let senders = await initSenders(config);
  let curMessage;
  console.log("你好！");
  while (true) {
    //判断senderName。
    let senderName = await whoWillSend(preText, initJudgeModel(config));
    //获取curMessage。采用senders[senderName].getText

    //console.log(senders, senderName, preText);
    curMessage = await getSenderMessage(senders, senderName, preText);

    if (curMessage === "exit") {
      break;
    }
    //更新当前消息
    show(curMessage);
    //更新preText
    preText = updatePre(preText, curMessage);
    //将preText存到文件中。异步函数但不加await,以放后台运行
    //log(preText, preTextAddress);
  }
}

main("./dist/config.json", "./dist/preText.json");
