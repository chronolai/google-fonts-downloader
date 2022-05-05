const https = require("https");
const path = require("path");
const fs = require("fs");
var request = require("request");

const target = "./fonts";
const fonts = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500;700&display=swap",
  //   "https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap",
];
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36";
// const ua = "";

function dlFile(url, to) {
  var options = {
    url,
    headers: {
      "User-Agent": ua,
    },
  };

  const file = fs.createWriteStream(to);
  file.on("finish", () => {
    file.close();
  });

  request(options, (error, response, body) => {
    file.write(body);
  });
}

function downloadFile(url, to) {
  const file = fs.createWriteStream(to);
  https
    .get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
      });
    })
    .on("error", (err) => console.err(err));
}

function getContent(url) {
  return new Promise((resolve, reject) => {
    var options = {
      url,
      headers: {
        "User-Agent": ua,
      },
    };
    request(options, (error, response, body) => {
      resolve(body);
    }).on("error", (err) => reject(err));
  });
}

fs.mkdir(path.join(__dirname, target), (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`${target} created successfully!`);
});

Promise.all(fonts.map((font) => getContent(font))).then((responses) => {
  let content = responses.join("\n");

  const regex = /(https?:\/\/[^/]+(\/[\.\w-]+)+)/gi;
  const urls = content.match(regex);
  const files = urls.map((url) => {
    const file = url
      .replace("https://fonts.gstatic.com/s/", "")
      .replace(/\//g, "_");
    return {
      url,
      file: `${target}/${file}`,
    };
  });
  console.error(files);

  files.forEach((file) => {
    content = content.replace(file.url, file.file);
    dlFile(file.url, file.file);
  });

  fs.createWriteStream("fonts.css").write(content);
});
