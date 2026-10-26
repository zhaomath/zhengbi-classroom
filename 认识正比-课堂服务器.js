#!/usr/bin/env node
/* ============================================================
 * 认识正比例 · 课堂服务器（零依赖，可本地也可发布到公网）
 * 作用：
 *   1) 托管「认识正比-实时互动课堂.html」
 *   2) 提供 短轮询 + POST 中继，让教师端与多台学生平板实时同步
 * 端口：
 *   - 优先读环境变量 PORT（公网发布平台注入）
 *   - 否则读命令行参数，默认 8080
 *   - 绑定 0.0.0.0
 * 中继说明（为何用轮询而非 SSE）：
 *   公网反向代理/网关对长连接(SSE/WebSocket)支持不稳定、且会剥离 URL
 *   的 query 参数。本服务把“房间号”放进【路径】( /poll/{room} )，把上行消息的
 *   房间号放进【请求体】，二者均不会被网关剥离，任何 HTTP 网关都支持短轮询。
 * ============================================================ */
"use strict";
const http=require("http");
const fs=require("fs");
const path=require("path");

const PORT=Number(process.env.PORT)||Number(process.argv[2])||8080;
const FILE=path.join(__dirname,"认识正比-实时互动课堂.html");

/* 房间消息队列：room -> [{...原始消息, _id}] ，_id 自增用于客户端去重 */
const rooms={};
let _seq=0;
const ROOM_MAX=1500;   // 每房间最多保留消息数（足够一堂热闹课）

function pushMsg(room,msg){
  if(!room) return;
  if(!rooms[room]) rooms[room]=[];
  msg._id=(++_seq);
  rooms[room].push(msg);
  if(rooms[room].length>ROOM_MAX) rooms[room].splice(0, rooms[room].length-ROOM_MAX);
}

/* 用请求头构造“真实访问地址”（局域网/公网通吃），注入页面保证二维码指向正确地址 */
function relayOrigin(req){
  const proto=(req.headers["x-forwarded-proto"]||"http").split(",")[0].trim()||"http";
  const host=req.headers.host||("localhost:"+PORT);
  return proto+"://"+host;
}

const server=http.createServer(function(req,res){
  const u=require("url").parse(req.url,true);
  let pathname=u.pathname||"/";

  // —— 轮询接收端点：/poll/{room} —— 返回该房间全部消息（JSON）
  let mm=pathname.match(/^\/poll\/([^/]+)\/?$/);
  if(mm){
    const room=decodeURIComponent(mm[1]);
    res.writeHead(200,{
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      "Access-Control-Allow-Origin":"*"
    });
    res.end(JSON.stringify(rooms[room]||[]));
    return;
  }

  // —— 发布端点：学生/教师上行（房间号在 body JSON 的 room 字段，不会被网关剥离）——
  if(pathname==="/pub" && req.method==="POST"){
    let body="";
    req.on("data",function(c){ body+=c; if(body.length>2e6) req.destroy(); });
    req.on("end",function(){
      let msg=null; try{ msg=JSON.parse(body); }catch(e){ msg=null; }
      if(msg && msg.room){
        pushMsg(msg.room, msg);
        res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"});
        res.end("ok");
      } else {
        res.writeHead(400,{"Content-Type":"text/plain; charset=utf-8"});
        res.end("bad: room required");
      }
    });
    return;
  }

  // —— 静态托管：默认返回课堂 HTML，并注入真实访问地址 ——
  fs.readFile(FILE,function(err,buf){
    if(err){
      res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});
      res.end("未找到课堂文件：认识正比-实时互动课堂.html（请与本服务器放在同一目录）");
      return;
    }
    let html=buf.toString("utf8");
    const origin=relayOrigin(req).replace(/"/g,'\\"');
    const inject='<script>window.__RELAY_ORIGIN__="'+origin+'";</script>';
    html=html.replace("<!--RELAY_ORIGIN_PLACEHOLDER-->", inject);
    res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
    res.end(html);
  });
});

server.listen(PORT,"0.0.0.0",function(){
  console.log("课堂服务器已启动 ✅  端口 "+PORT+" （绑定 0.0.0.0）");
  console.log("访问本应用的根路径即可进入；教师端创建课堂后分享课堂码/二维码。");
});
