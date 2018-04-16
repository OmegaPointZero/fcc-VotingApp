const Content = require('./models/polls.js')
const bcrypt = require('bcrypt-nodejs')

module.exports = (function(app,passport){

    app.get('/', function(req,res){
        res.redirect('/home')
    })

    app.get('/home', function(req,res){
      if(req.user==undefined){
            var uname = "Guest";
        } else {
            var uname = req.user.username
        }
        Content.find({}, {}, {sort:'-date'}, function(err, entries){
            res.render('home.ejs', {
                polls: entries,
                user : uname
            });
        });
    });

    app.get('/login', function(req,res){
        if (req.user == undefined){
                res.render('login.ejs', {
                    message: req.flash('loginMessage'), 
                });        
        } else {
            res.redirect('/profile')
        }
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash: true
    }));

    app.get('/signup', function(req,res){
        if(req.user == undefined){
            res.render('signup.ejs', {
                message: req.flash('signupMessage'),
            });
        } else {
            res.redirect('myprofile.ejs')
        }
    })

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true })
    );

    app.get('/profile', isLoggedIn, function(req,res) {
        Content.find({author: req.user.username}, {}, function(err, entries){
            res.render('myprofile.ejs', {
                name : req.user.username,
                user: req.user,
                mypolls: entries
            })
        });
    });

    app.get('/profile/:user', function(req,res){
        var user = req.params.user;
        Content.find({author: user}, {}, function(err, entries){
            res.render('profile.ejs', {
                user: user,
                mypolls: entries
            })
        })
    });

    app.get('/random', function(req,res){
        Content.find({}, {}, function(err, entries){
            console.log(entries)
            var len = entries.length;
            var ran = Math.floor(Math.random() * 1000);
            ran = ran % len;
            console.log(ran)
            var pollID = entries[ran].id;
            res.redirect('/poll/' + pollID);
        });
    });

    app.get('/poll/:id', function(req,res){
        var pollId = req.params.id;
        if(req.user==undefined){
            var uname = "Guest";
        } else {
            var uname = req.user.username
        }
        Content.findOne({id: pollId}, {}, function(err, entry){
            if(entry!=null){
                res.render('poll.ejs', {
                    pollId : pollId,
                    pollTitle: entry.title,
                    pollOpts : entry.options,
                    author : entry.author,
                    user : uname,
                });
            } else {
                res.redirect('/home');
            }
        })
    })

    app.get('/logout', function(req,res){
        req.logout();
        res.redirect('/');
    });

    app.post('/:id/vote', function(req,res){
        var Id = req.params.id;
        var thisVote = req.body.castVote;
        if(thisVote!="newPollOption"){
            Content.findOneAndUpdate(
                {
                    id: Id,
                    options: {
                        $elemMatch: {option: thisVote}
                    }
                },
                { $inc: {'options.$.votes': 1} }, function(err){
                    if(err) throw err
            })
        } else if(thisVote=="newPollOption"){
            console.log(req.body);
            var newObj = {}
            newObj['option'] = req.body.newinput;
            newObj['votes'] = 1;
            console.log(newObj);
            Content.update({id: Id}, {$push: {options: newObj}}, function(err){
                if(err) throw err
            })
        }

        res.redirect('/poll/'+Id) 

        }); 

    app.post('/newpoll', isLoggedIn, function(req,res){
        var title = req.body.title;
        var options =req.body.options
        var optArr = [];
        optArr = options.split(', ')
        console.log("optArr: " + optArr)
        var finalArr = [];
        for(var i=0;i<optArr.length;i++){
            var newObj = {}
            newObj['option'] = optArr[i];
            newObj['votes'] = 0;
            finalArr.push(newObj)
            console.log(finalArr)
        }
        var poll = new Content();
        var date = new Date().getTime();
        var id = bcrypt.hashSync(date, bcrypt.genSaltSync(8), null)
        id = id.slice(id.length-8,id.length)
        poll.id = id;
        poll.title = title;
        poll.author = req.user.username;
        poll.options = finalArr;        
        poll.save(function(err) {
            if(err) throw err
         })

        res.redirect('/poll/' + id);

    })

    app.post('/poll/delete/:id', isLoggedIn, function(req,res){
        var Id = req.params.id;
        Content.findOneAndRemove({ id: Id, author: req.user.username}, function(err){
            if(err) throw err;
        })
        res.redirect('/profile');
    })

    function isLoggedIn(req,res,next){
        if(req.isAuthenticated())
            return next();
        res.redirect('/login');
    }

});
