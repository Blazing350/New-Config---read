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
    var staticip = req.body.staticip;
    var units = req.body.units.replace(/\r\n/g,"\n").split("\n");
    var vlans = units.length + 400;
    var vlans2 = units.length - 255;
    var v111 = req.body.v111;
    var v112 = req.body.v112;
    var sfp1ip = req.body.sfp1ip;
    var ipv6 = req.body.ipv6;
    var statefile;
    var name2 = name.substring(12, 15) + name.substring(8, 12) + name.substring(3, 7);

    var sfp1end = sfp1ip.substring(sfp1ip.length - 3, sfp1ip.length);
    let nsfp1 = sfp1ip.substring(0, sfp1ip.length - 3);
    if (sfp1ip.charAt(sfp1ip.length - 3) == "/" && sfp1ip.charAt(sfp1ip.length - 7) == ".") {
        var sfp1g = nsfp1.substring(nsfp1.length - 3);
        var sfp1n = sfp1ip.substring(0, sfp1ip.length - 6);
    }
    else if (sfp1ip.charAt(sfp1ip.length - 3) == "/" && sfp1ip.charAt(sfp1ip.length - 6) == ".") {
        sfp1g = nsfp1.substring(nsfp1.length - 2);
        sfp1n = sfp1ip.substring(0, sfp1ip.length - 5);
    }
    else if (sfp1ip.charAt(sfp1ip.length - 3) == "/" && sfp1ip.charAt(sfp1ip.length - 5) == ".") {
        sfp1g = nsfp1.substring(nsfp1.length - 1);
        sfp1n = sfp1ip.substring(0, sfp1ip.length - 4);
    }
    let gsfp1 = parseInt(sfp1g) - 6;
    let g2sfp1 = parseInt(sfp1g) - 2;

    let nv1ip = v112.substring(0, v112.length - 5);
    let end1 = parseInt(nv1ip.substring(nv1ip.length - 1));
    let nv111ip = v111.substring(0, v111.length - 5);
    let end11 = parseInt(nv111ip.substring(nv111ip.length - 1));

    let nstatic = staticip.substring(0, staticip.length - 3);
    let gstatic = parseInt(nstatic.substring(nstatic.length - 1)) - 1;

// file location //
    if ( name2.startsWith("ga")) {statefile = "Georgia";}
    else if (name2.startsWith("al")) {statefile = "Alabama";}
    else if (name2.startsWith("fl")) {statefile = "Florida";}
    else if (name2.startsWith("tx")) {statefile = "Texas";}
    else if (name2.startsWith("sc")) {statefile = "South Carolina";}
    else if (name2.startsWith("nc")) {statefile = "North Carolina";}

    let enddest = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name2 + " (" + site + ")/" + name + ".rsc";
    let enddest1 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name2 + " (" + site + ")\"/" + name + ".rsc";
    let enddest2 = "/Configurations/Sites/\"" + statefile + "\"/\"" + name2 + " (" + site + ")\"/";
    let enddest3 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name2 + " (" + site + ")\"";
    let enddest4 = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name2 + " (" + site + ")";
    let enddest5 = "/home/pi/NewConfig/Temp/Zip/" + name + ".rsc";

/*     let enddest = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name.substring(0,11) + " (" + site + ")/" + name + ".rsc";
    let enddest1 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"/" + name + ".rsc";
    let enddest2 = "/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"/";
    let enddest3 = "/home/pi/Documents/Configurations/Sites/\"" + statefile + "\"/\"" + name.substring(0,11) + " (" + site + ")\"";
    let enddest4 = "/home/pi/Documents/Configurations/Sites/" + statefile + "/" + name.substring(0,11) + " (" + site + ")";
    let enddest5 = "/home/pi/NewConfig/Temp/Zip/" + name + ".rsc"; */
// end file location //

// start - all //
const fileOps = async () => {
    try {
        let start = "/system routerboard settings set auto-upgrade=yes\n#<>#System ID#\n/system id set name=" + name + 
        "\n#Admin Login#\n/user aaa set use-radius=yes accounting=yes interim-update=5m default-group=read\n" + 
        "/radius add secret=radj@ck3t5 address=162.255.88.30 timeout=3s src-address=" + nstatic + "\n";
        const data0 = await fspromises.readFile("1072 Config/all.txt", "utf8");
        await fspromises.writeFile(enddest, start + data0);
// end start - all //

// interface vlans //
        const data1 = await fspromises.readFile("1072 Config/allvlan.txt", "utf8");
        await fspromises.appendFile(enddest, "\n\n" + data1);
        for (let i = 0; i < units.length;) {
            for (let x = 400; x < vlans; x++) {
                await fspromises.appendFile(enddest, "add interface=sfp-sfpplus8 name=u" + units[i] + "-v" + x + " vlan-id=" + x + "\n");
                i++;
            }
        }
        await fspromises.appendFile(enddest, "\n\n");
// end interface vlans //

// ip address // @!
        let ipstart = "\n#<>#VLAN IPs#\n/ip address\nadd interface=sfp-sfpplus1 address=" + sfp1ip + " comment=uplink\n" +
        "add interface=v112 address=" + v112 +  " comment=Aps\nadd interface=v111 address=" + v111 + " comment=NET-Mgmt\n" +
        "add interface=v75 address=" + staticip + " comment=\"Public Statics\"\n";
        const data2 = await fspromises.readFile("1072 Config/allips.txt", "utf8");
        await fspromises.appendFile(enddest, ipstart + data2);
        if (units.length > 255) {
            for (let i = 0; i < 255;) {
                for (let x = 1; x <= 255; x++) {
                    await fspromises.appendFile(enddest, "add interface=u" + units[i] + " address=10.1." + x + ".1/24\n");
                    i++;
                }
            }
            for (let i = 255; i < units.length;) {
                for (let x = 1; x <= vlans2; x++) {
                    await fspromises.appendFile(enddest, "add interface=u" + units[i] + " address=10.2." + x + ".1/24\n");
                    i++;
                }
            }
        } else if (units.length <= 255) {
            for (let i = 0; i < units.length;) {
                for (let x = 1; x <= units.length; x++) {
                    await fspromises.appendFile(enddest, "add interface=u" + units[i] + " address=10.1." + x + ".1/24\n");
                    i++;
                }
            }
        }
        await fspromises.appendFile(enddest, "\n\n");
// end ip address //

// ip pools // @!
        const data3 = await fspromises.readFile("1072 Config/allpools.txt", "utf8");
        let poolstart = "\n\n#<>#VLAN Pool#\n/ip pool\nadd name=v112 ranges=" + 
        nv1ip.substring(0, nv1ip.length - 1) + end1 + ".10-" + nv1ip.substring(0, nv1ip.length - 1) + (end1 + 1) + ".250\n" +
        "add name=v111 ranges=" + nv111ip.substring(0, nv111ip.length - 1) + end11 +  ".100-" + nv111ip.substring(0, nv111ip.length - 1) + end11 + ".250\n";
        await fspromises.appendFile(enddest, poolstart + data3);
        if (units.length > 255) {
            for (let i = 0; i < 255;) {
                for (let x = 1; x <= 255; x++) {
                    await fspromises.appendFile(enddest, "add name=unit-" + units[i] + " ranges=10.1." + x + ".10-10.1." + x + ".250\n");
                    i++;
                }
            }
            for (let i = 255; i < units.length;) {
                for (let x = 1; x <= vlans2; x++) {
                await fspromises.appendFile(enddest, "add name=unit-" + units[i] + " ranges=10.2." + x + ".10-10.2." + x + ".250\n");
                    i++;
                }
            }
        } else if (units.length <= 255) {
            for (let i = 0; i < units.length;) {
                for (let x = 1; x <= units.length; x++) {
                await fspromises.appendFile(enddest, "add name=unit-" + units[i] + " ranges=10.1." + x + ".10-10.1." + x + ".250\n");
                    i++;
                }
            }
        }
// end ip pools //

// ip upnp //
        await fspromises.appendFile(enddest, "\n#UPNP#\n/ip upnp set enabled=yes\n/ip upnp interfaces\nadd forced-ip=" + nstatic + " interface=v75 type=external\n");
        for (let i = 0; i < units.length; i++) {
            await fspromises.appendFile(enddest, "add interface=u" + units[i] + " type=internal\n");
        }
//end ip upnp //

// dhcp networks // @!
        const data4 = await fspromises.readFile("1072 Config/alldhcp.txt", "utf8");
        let dhcpstart = "\n\n#<>#DHCP Networks#\n/ip dhcp-server network\nadd gateway=" + 
        v112.substring(0, v112.length - 3) + " address=" + v112.substring(0, v112.length - 4) + "0/23 dns-server=199.185.175.9,199.185.174.9\n" +
        "add gateway=" + v111.substring(0, v111.length - 3) + " address=" + v111.substring(0, v111.length - 4) + "0/24 dns-server=199.185.175.9,199.185.174.9\n" +
        "add gateway=" + staticip.substring(0, staticip.length -3) + " address=" + staticip.substring(0, staticip.length - 4) + gstatic + "/29 dns-server=199.185.175.9,199.185.174.9\n";
        await fspromises.appendFile(enddest, dhcpstart + data4);
        if (units.length > 255) {
            for (let i = 0; i < 255;) {
                for (let x = 1; x <= 255; x++) {
                    await fspromises.appendFile(enddest, "add gateway=10.1." + x + ".1 address=10.1." + x + ".0/24 dns-server=199.185.175.9,199.185.174.9\n");
                    i++;
                }
            }
            for (let i = 255; i < units.length;) {
                for (let x = 1; x <= vlans2; x++) {
                    await fspromises.appendFile(enddest, "add gateway=10.2." + x + ".1 address=10.2." + x + ".0/24 dns-server=199.185.175.9,199.185.174.9\n");
                    i++;
                }
            }
        } else if (units.length <= 255) {
            for (let i = 0; i < units.length;) {
                for (let x = 1; x <= units.length; x++) {
                    await fspromises.appendFile(enddest, "add gateway=10.1." + x + ".1 address=10.1." + x + ".0/24 dns-server=199.185.175.9,199.185.174.9\n");
                    i++;
                }
            }
        }
// end dhcp networks //

// dhcp server //
        const data5 = await fspromises.readFile("1072 Config/alldhcps.txt", "utf8");
        await fspromises.appendFile(enddest, data5);
        for (let i = 0; i < units.length; i++) {
            await fspromises.appendFile(enddest, "add disabled=no lease-time=8h name=unit-" + units[i] + " interface=u" + units[i] + " address-pool=unit-" + units[i] + "\n");
        }
// end dhcp server //

// firewall //
        let fstart = "\n#<>#IP FIREWALL NAT#\n/ip dns set servers=199.185.174.9,199.185.175.9,2001:4860:4860::8888,2606:4700:4700::1111\n" + 
        "/ip firewall nat add chain=srcnat src-address-list=siteNetworks action=src-nat to-addresses=" + staticip.substring(0, staticip.length -3) + "\n\n";
        await fspromises.appendFile(enddest, fstart);
// end firewall //

// ipv6 //
        let ipv6start = "#<IPV6>#\n/ipv6 address\nadd address=" + ipv6 + ":50::1/64 interface=v50\nadd address=" + ipv6 + ":75::1/64 interface=v75\nadd address=" + ipv6 + ":100::1/64 interface=v100\n" + 
        "add address=" + ipv6 + ":111::1/64 interface=v111\nadd address=" + ipv6 + ":112::1/64 interface=v112\nadd address=" + ipv6 + ":299::1/64 interface=v299\n";
        await fspromises.appendFile(enddest, ipv6start);
        for (let i = 300; i <= 310; i++) {
            await fspromises.appendFile(enddest, "add address=" + ipv6 + ":" + i + "::1/64 interface=v" + i + "\n");
        }
        for (let i = 0; i < units.length;) {
            for (let x = 400; x < vlans; x++) {
                await fspromises.appendFile(enddest, "add address=" + ipv6 + ":" + x + "::1/64 interface=u" + units[i] + "\n");
                i++;
            }
        }
// end ipv6 //

// ospf //
        const data6 = await fspromises.readFile("1072 Config/ospf.txt", "utf8");
        if (sfp1end == "/29") {
            await fspromises.appendFile(enddest, data6 + sfp1n + gsfp1 + "/29 priority=1 type=ptp\n\n");
            await fspromises.appendFile(enddest, "/ip route add disabled=no distance=250 dst-address=0.0.0.0/0 gateway=" + sfp1n + (parseInt(sfp1g) - 5) + " pref-src=\"\" routing-table=main scope=30 suppress-hw-offload=no target-scope=10\n");
            await fspromises.appendFile(enddest, "/ip firewall filter add action=accept chain=input src-address=" + sfp1n + gsfp1 + "/29\n");
        }
        else if (sfp1end == "/30") {
            await fspromises.appendFile(enddest, data6 + sfp1n + g2sfp1 + "/30 priority=1 type=ptp\n\n");
            await fspromises.appendFile(enddest, "/ip route add disabled=no distance=250 dst-address=0.0.0.0/0 gateway=" + sfp1n + (parseInt(sfp1g) - 1) + " pref-src=\"\" routing-table=main scope=30 suppress-hw-offload=no target-scope=10\n");
            await fspromises.appendFile(enddest, "/ip firewall filter add action=accept chain=input src-address=" + sfp1n + g2sfp1 + "/30\n");
        }
        await fspromises.appendFile(enddest, "/routing ospf interface-template add area=backbone-v2 cost=10 disabled=yes interfaces=v75 networks=" + staticip.substring(0, staticip.length - 4) + gstatic + "/29 priority=1 type=broadcast\n");
        await fspromises.appendFile(enddest, "/ip firewall address add address=" + v111 + " list=siteNetworks\n/ip firewall address add address=" + v112 + " list=siteNetworks\n\n");
        
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

            res.render("1072", {
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
