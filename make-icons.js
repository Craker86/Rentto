const sharp = require("sharp");
const svg = '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" rx="80" fill="#065f46"/><text x="256" y="340" font-size="300" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle">R</text></svg>';
sharp(Buffer.from(svg)).resize(192).toFile("public/icon-192.png").then(function(){console.log("icon-192 creado")});
sharp(Buffer.from(svg)).resize(512).toFile("public/icon-512.png").then(function(){console.log("icon-512 creado")});
