const express = require("express"),
    app = express(),
    port = 80;
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const admzip = require("adm-zip");
var pway = "/home/pi/NewConfig/"

// create zip file //
async function createZip() {
    try {
        const zip = new admzip();
        zip.addLocalFolder("./Temp/Zip");
        zip.writeZip("./Temp/switches.zip");
        console.log("zip file created");
    } catch (e) {
        console.log("zip error");
    }
}
// end create zip file //

// dependencies - middleware //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(pway, "/Public")));
app.use(express.static(path.join(pway, "/Logs")));
app.set('view engine', 'ejs');
// end dependencies - middleware //

// use data files //
app.use("/326", require(path.join(pway, "Data", "326")));
app.use("/328", require(path.join(pway, "Data", "328")));
app.use("/354", require(path.join(pway, "Data", "354")));
app.use("/518", require(path.join(pway, "Data", "518")));
app.use("/1072", require(path.join(pway, "Data", "1072")));
app.use("/2004", require(path.join(pway, "Data", "2004")));
app.use("/2216", require(path.join(pway, "Data", "2216")));
// end use data files //

// render pages //
app.get("^/$|/index$|/home", (req, res) => {
    res.render(path.join(pway, "views", "index.ejs"));
});
app.get("/326", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "326.ejs"), {
            dnames: disnames
        });
    });
});
app.get("/328", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "328.ejs"), {
            dnames: disnames,
        });
    });
});
app.get("/354", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "354.ejs"), {
            dnames: disnames,
        });
    });
});
app.get("/518", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "518.ejs"), {
            dnames: disnames
        });
    });
});
app.get("/1072", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "1072.ejs"), {
            dnames: disnames
        });
    });
});
app.get("/2004", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "2004.ejs"), {
            dnames: disnames
        });
    });
});
app.get("/2216", (req, res) => {
    fs.readFile("/home/pi/NewConfig/Temp/disnames.json", (err, data) => {
        const disnames = JSON.parse(data);
        res.render(path.join(pway, "views", "2216.ejs"), {
            dnames: disnames
        });
    });
});
// end render pages //

// download files //
app.route("/download")
    .post ((req, res) => {
        createZip();
        res.download(path.join(pway, "Temp", "switches.zip"));
    });
// end download files //

// 404 error //
app.use((req, res) => {
    res.status(404).render(path.join(pway, "views", "404.ejs"));
});
// end 404 error //

// listen to port //
app.listen(port, () => {
    console.log("Server running on port " + port);
});
// end listen to port //