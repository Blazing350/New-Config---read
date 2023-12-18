const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const fspromises = require("fs").promises;
const exec = require("child_process").exec;
var logs = {};
module.exports = router;

// date - time //
var ts = Date.now();
var dt = new Date(ts);
var day = dt.getDate();
var month = dt.getMonth() + 1;
var year = dt.getFullYear();
var hours = dt.getHours();
var mins = dt.getMinutes();
var secs = dt.getSeconds();
var date = month + "/" + day + "/" + year;
var time = hours + ":" + mins + ":" + secs;
// end date - time //

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false}));

router.post("/", (req, res) => {
    var name = req.body.name;
    var ip = req.body.ip;
    var site = req.body.site;
    var statefile;
    for (var i = 8; i <= 11; i++ ) {
        if (ip.charAt(i) == "." && ip.charAt(i+4) == "/") {
            var gate = ip.substring(0, ip.length - 6);
            break;
        } 
        else if (ip.charAt(i) == "." && ip.charAt(i+2) == "/") {
            gate = ip.substring(0, ip.length - 4);
            break;
        }
        else if (ip.charAt(i) == "." && ip.charAt(i+3) == "/") {
            gate = ip.substring(0, ip.length - 5);
            break;
        }
    }
    let start = "#<>#System ID#\n/system id set name=" + name + "\n\n#<># Add MGMT VLAN#\n/ip add rem 0\n" + 
    "/interface vlan add name=NET-MGMT-Vlan111 vlan-id=111 interface=bridge\n/ip dns set servers=199.185.175.9,199.185.174.9" +
    "\n/ip add add interface=NET address=" + ip + "\n/ip route add gateway=" + gate + "1\n/ip dhcp-client rem 0\n\n";
    let bup2 = "\n    \\n:local ftppath \\\"/" + name.substring(0,6).toUpperCase() + "/" + site + "/\\\"\\r\\";

// file location //
    if ( name.startsWith("ga")) {statefile = "Georgia";}
    else if (name.startsWith("al")) {statefile = "Alabama";}
    else if (name.startsWith("fl")) {statefile = "Florida";}
    else if (name.startsWith("tx")) {statefile = "Texas";}
    else if (name.startsWith("sc")) {statefile = "South Carolina";}
    else if (name.startsWith("nc")) {statefile = "North Carolina";}

    let enddest = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name.substring(0,11) + " (" + site + ")/" + name + ".txt";
    let enddest1 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"/" + name + ".txt";
    let enddest2 = "/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"/";
    let enddest3 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"";
    let enddest4 = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name.substring(0,11) + " (" + site + ")";
    let enddest5 = "/home/pi/NewConfig/Temp/Zip/" + name + ".txt";
// end file location //

// start - all //
    const fileOps = async () => {
        try {
            const data0 = await fspromises.readFile("518 Config/all.txt", "utf8");
            await fspromises.writeFile(enddest, start + data0);
// end start - all //

// backup //
            const bup1 = await fspromises.readFile("518 Config/backup1.txt", "utf8");
            await fspromises.appendFile(enddest, "\n\n" + bup1 + bup2);
            const bup3 = await fspromises.readFile("518 Config/backup3.txt", "utf8");
            await fspromises.appendFile(enddest, "\n" + bup3);
// end backup //
            await fspromises.appendFile(enddest, "\n\n#End Config\n/sys reb\ny\n\n");          
// copy file to zip //
            const dataz = await fspromises.readFile(enddest, "utf8");
            await fspromises.writeFile(enddest5, dataz);
//end copy file to zip //
        }
        catch (err) {
            console.error(err);
        }     
    }
// file sync //
    const fileSync = async () => {
        try {
            const disnames = await fspromises.readFile("/home/pi/NewConfig/Temp/disnames.json", "utf-8");
            var dnames = JSON.parse(disnames);
            if (fs.existsSync(enddest)) {

                console.log("updating");
                dnames.push({status: "Updated " +  req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.loopback, site: req.body.site, src: enddest2, status: "Device Updated"};

            } else if (fs.existsSync(enddest4)) {

                console.log("Creating");
                dnames.push({status: "Created " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.loopback, site: req.body.site, src: enddest2, status: "Device Created"};

            } else {

// make dir //
                console.log("dne / creating");
                exec('mkdir ' + enddest3, (err, stdout, stderr) => {
                    if (err) {console.error(err);}
                    console.log("stderr", stderr);
                });
// end make dir //
                
                dnames.push({status: "Created Site / " + req.body.name.substring(0,11) + " (" + site + ")"});
                dnames.push({status: "Created " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.loopback, site: req.body.site, src: enddest2, status: "Site / Device Created"};
            }
            
            console.log(dnames);
            console.log(logs);

// logs //
            var logsJSON = JSON.stringify(logs, null, " ");
            await fspromises.appendFile("Logs/logs.json", logsJSON);
            logs = {};
// end logs //

// json array //
            var namesJson = JSON.stringify(dnames);
            await fspromises.writeFile("/home/pi/NewConfig/Temp/disnames.json", namesJson);
// end json array //

            exec('rclone copy -v ' + enddest1 + " onedrive:\"Documents - Infrastructure\"" + enddest2, (err, stdout, stderr) => {
                if (err) {console.error(err);}
                console.log("stderr", stderr);
            });

            res.render("518", {
                dnames: dnames
            });
        }
        catch (err) {
            console.error(err);
        }
    }
// end file sync //
    fileSync();
    fileOps();
});
