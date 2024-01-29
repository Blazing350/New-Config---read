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
    var nbvlans = req.body.bvlans.replace(/\r\n/g,"\n").split("\n");
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
    var vlans = [req.body.e1,req.body.e2,req.body.e3,req.body.e4,req.body.e5,req.body.e6,
        req.body.e7,req.body.e8,req.body.e9,req.body.e10,req.body.e11,req.body.e12,
        req.body.e13,req.body.e14,req.body.e15,req.body.e16,req.body.e17,req.body.e18,
        req.body.e19,req.body.e20,req.body.e21,req.body.e22,req.body.e23,req.body.e24];
    console.log(vlans);
    var bvlans = [...new Set(vlans)];
    var comments = [req.body.c1,req.body.c2,req.body.c3,req.body.c4,req.body.c5,req.body.c6,
        req.body.c7,req.body.c8,req.body.c9,req.body.c10,req.body.c11,req.body.c12,req.body.c13,
        req.body.c14,req.body.c15,req.body.c16,req.body.c17,req.body.c18,req.body.c19,req.body.c20,
        req.body.c21,req.body.c22,req.body.c23,req.body.c24];
    var vlan111 = "\n\n/interface bridge vlan add bridge=bridge tagged=\"bridge,sfp-sfpplus1,sfp-sfpplus2\" vlan-ids=111"
    let bup2 = "\n    \\n:local ftppath \\\"/" + name.substring(0,6).toUpperCase() + "/" + site + "/\\\"\\r\\";
    let start = "#<>#System ID#\n/system id set name=" + name + "\n\n#<># Add MGMT VLAN#\n/ip add rem 0\n" + 
    "/interface vlan add name=NET-MGMT-Vlan111 vlan-id=111 interface=bridge\n/ip dns set servers=199.185.175.9,199.185.174.9" +
    "\n/ip add add interface=NET address=" + ip + "\n/ip route add gateway=" + gate + "1\n/ip dhcp-client rem 0\n\n";

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

// start - all//
    const fileOps = async () => {
        try {
            const data0 = await fspromises.readFile("326 Config/all.txt", "utf8");
            await fspromises.writeFile(enddest, start);
            await fspromises.appendFile(enddest, data0);
// end start - all //
// vlans //
            for (let i = 0; i < vlans.length; i++) {
                await fspromises.appendFile(enddest, "\n/int bridge port set " + i + " pvid=" + vlans[i]);
            }
            bvlans = bvlans.filter(item => item != 1);
            bvlans = bvlans.filter(item => item != 111);
            console.log(bvlans);
            await fspromises.appendFile(enddest, vlan111);
            for(let i = 0; i < bvlans.length; i++) {
                await fspromises.appendFile(enddest, "\n/interface bridge vlan add bridge=bridge tagged=\"bridge,sfp-sfpplus1,sfp-sfpplus2\" vlan-ids=" + bvlans[i]);
            }
            if (nbvlans[0] == "") {
                await fspromises.appendFile(enddest, "\n\n/interface bridge set bridge vlan-filtering=yes protocol-mode=mstp\n/\n\n");
            } else {
                for (let i = 0; i < nbvlans.length; i++) {
                    await fspromises.appendFile(enddest, "\n/interface bridge vlan add bridge=bridge tagged=\"bridge,sfp-sfpplus1,sfp-sfpplus2\" vlan-ids=" + nbvlans[i]);
                }
            }
            await fspromises.appendFile(enddest, "\n\n/interface bridge set bridge vlan-filtering=yes protocol-mode=mstp\n/\n\n");
// end vlans //
// unit comments //
            for (let i = 0; i < comments.length; i++) {
                await fspromises.appendFile(enddest, "\n/int eth set " + i + " comment=" + comments[i]);
            }
// end unit comments //
// copy file to zip //
            const dataz = await fspromises.readFile(enddest, "utf8");
            await fspromises.writeFile(enddest5, dataz);
//end copy file to zip //
        } catch (err) {
        console.error(err);
        }
    }
// file sync //
    const fileSync = async () => {
        try {
            const disnames = await fspromises.readFile("/home/pi/NewConfig/Temp/disnames.json", "utf-8");
            var dnames = JSON.parse(disnames);
            if (fs.existsSync(enddest)) {
                
                console.log("Updating");
                dnames.push({status: "Updated " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.ip, site: req.body.site, src: enddest2, status: "Device Updated"};

            } else if (fs.existsSync(enddest4)) {

                console.log("Creating");
                dnames.push({status: "Created " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.ip, site: req.body.site, src: enddest2, status: "Device Created"};

            } else {

// make dir //
            console.log("dne / Creating");
                exec('mkdir ' + enddest3, (err, stdout, stderr) => {
                    if (err) {console.error(err);}
                    console.log("stderr", stderr);
                });
// end make dir //

                dnames.push({status: "Created Site / " + req.body.name.substring(0,11) + " (" + site + ")"});
                dnames.push({status: "Created " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.ip, site: req.body.site, src: enddest2, status: "Site / Device Created"};
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
        
            res.render("326", {
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
