const express = require('express');
const app = express();
const ldap = require('ldapjs');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'hbs');
app.engine('hbs', exphbs({
    layoutsDir: __dirname + '/public',
    extname: 'hbs',
    defaultLayout: false
}));

app.listen(5000, function () {
    console.log("server running at 5000");
})

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/", function (req, res) {
    res.render('index.hbs');
})

app.get("/login", function (req, res) {
    res.render('login.hbs')
})

app.post("/details", function (req, response) {
    console.log(req.body);
    var opts = {
        filter: '(&(uid=' + req.body.user_name + ')(mail=' + req.body.user_mail + ')(userPassword=' + req.body.user_pass + '))',
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn', 'ou', 'mail', 'userPassword']
    }
    username = "uid=" + req.body.user_name + ",dc=example,dc=com";
    password = "password";

    var client = ldap.createClient({
        url: 'ldap://ldap.forumsys.com:389'
    })
    client.bind(username, password, function (err) {
        if (err) {
            console.log(err);
            return response.render('err.hbs');
        }
        else {
            console.log(opts.filter);
            client.search('dc=example,dc=com', opts, function (err, res) {
                if (err) {
                    console.log(err);
                    return response.write('try_harder');
                }
                else {
                    res.on('searchEntry', function (entry) {
                        if (entry.object.dn) {
                            if (entry.object.mail == req.body.user_mail) {
                                return response.render('dashboard.hbs', { uid: entry.object.dn, sn: entry.object.sn, cn: entry.object.cn, userPassword: entry.object.userPassword, flag: "flag{L_D_A_P}" })
                            }
                            else {
                                return response.render('dashboard.hbs', { uid: entry.object.dn, sn: entry.object.sn, cn: entry.object.cn, userPassword: entry.object.userPassword, flag: "flag{no_flags_for_you}" })
                            }
                        }
                    });
                    res.on('searchReference', function (referral) {
                        console.log('referral: ' + referral.uris.join());
                    });
                    res.on('error', function (err) {
                        console.error('error: ' + err.message);
                        return response.redirect('/');
                    });
                    res.on('end', function (result, entry) {
                    if(entry==undefined){
                        client.unbind();
                        client.destroy();
                        return response.render('err.hbs');
                    }
                        console.log('status: ' + result.status);
                    });

                }
            })
        }
    })
})
app.get("/find", function (err, res) {
    res.render('search.hbs')
})
app.post("/search", function (req, response) {
    console.log(req.body.search);
    var opts = {
        filter: '(cn=' + req.body.search + ')',
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn', 'ou']
    }
    var client = ldap.createClient({
        url: 'ldap://ldap.forumsys.com:389'
    })
    client.search('dc=example,dc=com', opts, function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(opts.filter)
            res.on('searchEntry', function (entry) {
                console.log(JSON.stringify(entry.object))
                return response.write(JSON.stringify(entry.object).replace("{", "").replace("}", "\n\n"), 'utf8');
            });
            res.on('searchReference', function (referral) {
                console.log('referral: ' + referral.uris.join());
                console.log(referral.object)
            });
            res.on('error', function (err) {
                console.error('error: ' + err.message);
                return response.redirect('/');
            });
            res.on('end', function (result, entry) {
                console.log('status: ' + result.status);
                client.destroy();
            });
        }
    })
})