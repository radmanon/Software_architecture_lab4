const http = require("http");
const url = require("url");

let dictionary = [] // to store words and definitions
let requestCount = 0; // track num requests

const server = http.createServer((req, res)=>{
    requestCount++;
    const parsedUrl = url.parse(req.url, true);

    res.setHeader("Access-Control-Allow-Origin", "*"); // allow any origin to access API
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // GET and POST and OPTIONS
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");


    // this might not be neccessary but for make sure we are trying to make it closer to a real server file
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // POST recieve and store the definition
    if (req.method === "POST" && parsedUrl.pathname === "/api/definitions") {
        let body = "";
        req.on("data", chunk => {body+= chunk;});
        req.on("end", () => {
            let data = JSON.parse(body);

            if (!data.word || !data.definition) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Invalid input: word and definition are required" }));
            }

            if (dictionary.some(entry => entry.word === data.word)) {
                res.writeHead(409, {"Content-Type": "application/json"});
                return res.end(JSON.stringify({message: `Request#${requestCount}: ${data.word} already exist`}));
            }

            dictionary.push({word: data.word, definition: data.definition});
            res.writeHead(201, {"Content-Type": "application/json"});

            res.end(JSON.stringify({
                message: `Request #${requestCount}: New Entry recorded: ${data.word} - ${data.definition}`, total_entries: dictionary.length
            }))
        })
        
        
    // GET, retrieve the word
    } else if(req.method === "GET" && parsedUrl.pathname === "/api/definitions") {
        let word = parsedUrl.query.word; // gete the word

        if (!word) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid request: missing 'word' parameter" }));
        }

        let entry = dictionary.find(entry => entry.word === word);
        res.writeHead(200, {"Content-Type": "application/json"});

        if(entry){
            res.end(JSON.stringify({
                message: `Request #${requestCount}: ${word} - ${entry.definition}`, total_entries: dictionary.length
            }));

        } else {
            res.end(JSON.stringify({
                message: `Request #${requestCount}: Word "${word}" not found.`, total_entries: dictionary.length
            }));
        }


    } else {
        res.writeHead(404, {"Content-Type": "application/json"});
        res.end(JSON.stringify({message: "Endpoint not found"}));
    }
})

server.listen(2000, () => {
    console.log("Server is running on port 2000");
});

//**
// this code developed by getting assistance from ChatGPT (https://chat.openai.com/) regarding 
// the methods "find", "some", "push" in GET and PSOT.
//  */