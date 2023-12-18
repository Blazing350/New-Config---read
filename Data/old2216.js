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
    var site = req.body.site;
    var vlans = req.body.vlans;
    var vip;
    var loopback = req.body.loopback;
    var v111 = req.body.v111;
    var v1 = req.body.v1;
    var sfp1ip = req.body.sfp1ip;
    var sfp1g = req.body.sfp1g;
    var ipv6 = req.body.ipv6;
    var ipv6l = req.body.ipv6l;
    var statefile;
    let start = "/system routerboard settings set auto-upgrade=yes\n#<>#System ID#\n/system id set name=" + name + 
    "\n#Admin Login#\n/user aaa set use-radius=yes accounting=yes interim-update=5m default-group=read\n" + 
    "/radius add secret=radj@ck3t5 address=162.255.88.30 timeout=3s src-address=" + loopback + "\n";
    let ipstart = "\n#<>#VLAN IPs#\n/ip address add interface=sfp28-1 address=" + sfp1ip + " comment=\n" +
    "/ip address add interface=loopback address=" + loopback + " comment=Loopback\n/ip address add interface=customer address=" + 
    v1 +  " comment=Vlan1\n/ip address add interface=v111 address=" + v111 + " comment=NET-Mgmt\n";
    let bup2 = "\n    \\n:local ftppath \\\"/" + name.substring(0,6).toUpperCase() + "/" + site + "/\\\"\\r\\";


// file location //
    if ( name.startsWith("ga")) {statefile = "Georgia";}
    else if (name.startsWith("al")) {statefile = "Alabama";}
    else if (name.startsWith("fl")) {statefile = "Florida";}
    else if (name.startsWith("tx")) {statefile = "Texas";}
    else if (name.startsWith("sc")) {statefile = "South Carolina";}
    else if (name.startsWith("nc")) {statefile = "North Carolina";}

    let enddest = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name.substring(0,11) + " (" + site + ")/" + name + ".rsc";
    let enddest1 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"/" + name + ".rsc";
    let enddest2 = "/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"/";
    let enddest3 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"";
    let enddest4 = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name.substring(0,11) + " (" + site + ")";
    let enddest5 = "/home/pi/NewConfig/Temp/Zip/" + name + ".rsc";
// end file location //

// start - all //
    const fileOps = async () => {
        try {
            const data0 = await fspromises.readFile("2216 Config/all.txt", "utf8");
            await fspromises.writeFile(enddest, start + data0);
// end start - all //

// interface vlans //
            const data1 = await fspromises.readFile("2216 Config/allvlan.txt", "utf8");
            await fspromises.appendFile(enddest, "\n\n" + data1);
            for (let i = 1000; i <= vlans; i++) {
                await fspromises.appendFile(enddest, "\n/interface vlan add interface=customer-bridge name=v" + i + " vlan-id=" + i);
            }
            await fspromises.appendFile(enddest, "\n\n");
// end interface vlans //

// bridge vlans //
/*             const data2 = await fspromises.readFile("2216 Config/bvlans.txt", "utf8");
            let vlx = 15;
            let y = 1050;
            for (let x = 1000; x < 1550; x += 50) {
                if (vlans <= y && vlans >= x) {
                    break;
                }
                else {
                    y = y + 50;
                    vlx ++;
                    vlx ++;
                }
            }
            for (let i = 0; i < vlx ; i++) {
                var varry = data2.toString().split("\n");
                await fspromises.appendFile(enddest, varry[i]);
            } */
// end bridge vlans //

// ip address //
            const data3 = await fspromises.readFile("2216 Config/allips.txt", "utf8");
            await fspromises.appendFile(enddest,"\n" + ipstart + data3 + "\n");
            for (let i = 0; i <= 550; i++) {
                if(i == (vlans-1000)) {
                    vip = i;
                    break;
                }
            }
            const data4 = await fspromises.readFile("2216 Config/ips.txt", "utf8");
            for (let x = 0; x <= vip; x++) {
                var iparry = data4.toString().split("\n");
                await fspromises.appendFile(enddest, iparry[x]);
            }
// end ip address //

// ip pools //
            let nv1ip = v1.substring(0, v1.length - 5);
            let end1 = parseInt(nv1ip.substring(nv1ip.length - 1));
            let nv111ip = v111.substring(0, v111.length - 5);
            let end11 = parseInt(nv111ip.substring(nv111ip.length - 1));
            let poolstart = "\n\n#<>#VLAN Pool#\n/ip pool add name=customer ranges=" + 
            nv1ip.substring(0, nv1ip.length - 1) + end1 + ".10-" + nv1ip.substring(0, nv1ip.length - 1) + (end1 + 1) + ".250\n" +
            "/ip pool add name=v111 ranges=" + nv111ip.substring(0, nv111ip.length - 1) + end11 +  ".100-" + nv111ip.substring(0, nv111ip.length - 1) + (end11 + 1) + ".250\n";

            const data5 = await fspromises.readFile("2216 Config/allpools.txt", "utf8");
            await fspromises.appendFile(enddest, poolstart + data5)
            const data6 = await fspromises.readFile("2216 Config/pools.txt", "utf8");
            for (let i = 0; i <= vip; i++) {
                var parray = data6.toString().split("\n");
                await fspromises.appendFile(enddest, "\n" + parray[i]);
            }
// end ip pools //

// dhcp networks //
            let dhcpstart = "\n\n#<>#DHCP Networks#\n/ip dhcp-server network add gateway=" + 
            v1.substring(0, v1.length - 3) + " address=" + v1.substring(0, v1.length - 4) + "0/23 dns-server=199.185.175.9,199.185.174.9\n" +
            "/ip dhcp-server network add gateway=" + v111.substring(0, v111.length - 3) + " address=" + v111.substring(0, v111.length - 4) + "0/23 dns-server=199.185.175.9,199.185.174.9\n";

            const data7 = await fspromises.readFile("2216 Config/alldhcp.txt", "utf8");
            await fspromises.appendFile(enddest, dhcpstart + data7);
            const data8 = await fspromises.readFile("2216 Config/dhcp.txt", "utf8");
            for (let i = 0; i <= vip; i++) {
                var dhcparray = data8.toString().split("\n");
                await fspromises.appendFile(enddest, "\n" + dhcparray[i]);
            }
// end dhcp networks //

// dhcp server //
            const data9 = await fspromises.readFile("2216 Config/alldhcps.txt", "utf8");
            await fspromises.appendFile(enddest, "\n\n" + data9);
            const data10 = await fspromises.readFile("2216 Config/dhcps.txt", "utf8");
            for (let i = 0; i <= vip; i++) {
                var dhcpsarray = data10.toString().split("\n");
                await fspromises.appendFile(enddest, "\n" + dhcpsarray[i]);
            }
// end dhcp server //

// firewall //
            let nsfp1ip = sfp1ip.substring(0, sfp1ip.length - 3);
            let fstart = "\n\n#<>#IP FIREWALL NAT#\n/ip dns set servers=199.185.174.9,199.185.175.9,2001:4860:4860::8888,2606:4700:4700::1111\n" +
            "/ip firewall nat add chain=srcnat src-address=100.64.0.0/10 action=src-nat to-addresses=" + loopback +
            "\n/ip firewall nat add action=src-nat chain=srcnat protocol=!ospf src-address=" + nsfp1ip + " to-addresses=" + loopback;
            await fspromises.appendFile(enddest, fstart);
// end firewall //

// backup //
            const bup1 = await fspromises.readFile("2216 Config/backup1.txt", "utf8");
            await fspromises.appendFile(enddest, "\n\n" + bup1 + bup2);
            const bup3 = await fspromises.readFile("2216 Config/backup3.txt", "utf8");
            await fspromises.appendFile(enddest, "\n" + bup3);
// end backup //

// ipv6 //
            let ipv6start = "\n\n####IPv6 Setup Section###\n/interface eoip add !keepalive name=Loopback-IPv6 remote-address=0.0.0.0 tunnel-id=0\n#\n" +
            "/ipv6 pool add name=DHCP-IPv6 prefix=" + ipv6 + "/48 prefix-length=64\n/ipv6 address add address=" + ipv6l + "/128 advertise=no interface=Loopback-IPv6\n\n";
            let ipv6end = "\n\n##Firewall\n/ipv6 firewall filter\nadd action=accept chain=forward in-interface=all-vlan out-interface=sfp28-1 disable=yes\n" +
            "add action=accept chain=forward in-interface=sfp28-1 out-interface=all-vlan disable=yes\nadd action=drop chain=forward in-interface=all-vlan out-interface=all-vlan disable=yes\n/";

            const data11 = await fspromises.readFile("2216 Config/allipv6.txt", "utf8");
            await fspromises.appendFile(enddest, ipv6start + data11);
            const data12 = await fspromises.readFile("2216 Config/ipv6add.txt", "utf8");
            for (let i = 0; i <= vip; i++) {
                var ipv6array = data12.toString().split("\n");
                await fspromises.appendFile(enddest, "\n" + ipv6array[i]);
            }
            const data13 = await fspromises.readFile("2216 Config/allipv6d.txt", "utf8");
            await fspromises.appendFile(enddest, "\n\n" + data13);
            const data14 = await fspromises.readFile("2216 Config/ipv6d.txt", "utf8");
            for (let i = 0; i <= vip; i++) {
                var ipv62array = data14.toString().split("\n");
                await fspromises.appendFile(enddest, "\n" + ipv62array[i]);
            }
            await fspromises.appendFile(enddest, ipv6end);
// end ipv6 //

// ospf //
            let startospf = "\n\n#<>#OSPF #\n/routing ospf instance\nadd disabled=no name=default-v2 router-id=" + loopback + 
            "\nadd disabled=no name=default-v3 redistribute=connected,static,vpn,dhcp,modem router-id=" + loopback +  " version=3\n/\n\n" +
            "/routing ospf area\nadd disabled=no instance=default-v2 name=backbone-v2\n" +
            "add area-id=" + sfp1g.substring(0, sfp1g.length - 3) + " default-cost=1 disabled=yes instance=default-v2 name=building-v2 no-summaries type=stub\n" +
            "add disabled=no instance=default-v3 name=backbone-v3\n/\n\n/routing ospf interface-template\n" + 
            "add area=backbone-v2 disabled=no interfaces=loopback networks=" + loopback + " priority=1\nadd area=backbone-v2 disabled=no interfaces=v111 networks=" +
            v111.substring(0,v111.length - 4) + "0/23 priority=1\nadd area=backbone-v2 disabled=no interfaces=customer-bridge networks=" + v1.substring(0,v1.length - 4) +
            "0/23 priority=1\n/\n\n\n##END CONFIG##";

            await fspromises.appendFile(enddest, startospf);
// end ospf //
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
                dnames.push({status: "Updated " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.loopback, site: req.body.site, vlans: req.body.vlans, src: enddest2, status: "Device Updated"};

            } else if (fs.existsSync(enddest4)) {

                console.log("Creating");
                dnames.push({status: "Created " + req.body.name});
                logs = {date: date, time: time, name: req.body.name, ip: req.body.loopback, site: req.body.site, vlans: req.body.vlans, src: enddest2, status: "Device Created"};

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
                logs = {date: date, time: time, name: req.body.name, ip: req.body.loopback, site: req.body.site, vlans: req.body.vlans, src: enddest2, status: "Site / Device Created"};
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

            res.render("2216", {
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
