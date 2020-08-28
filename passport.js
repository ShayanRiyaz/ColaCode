var passport = require('passport');
//const user = require('./models/user');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user,done){
    done(null,user._id);
});

passport.deserializeUser(function (id,done){
    User.findOne({_id : id}, function (err,user){
        done(err,user);
    })
});

passport.use(new localStrategy({
        usernameField : 'email'
    },
    function (username,password,done){
        User.findOne({email: username}, function(err,user){
            if (err) return done(err);
            if (!user){
                return done(null,false, {
                    message : 'Incorrect username or password'
                });
            }
            if (!user.validPassword(password)) {
                return done(null,false, {
                    message : 'Incorrect username of password.'
                });
            }
            return done(null,user);
        })
    }
));

passport.use(new facebookStrategy({
    clientID : '320346122547696',
    clientSecret: '4bb8602dcfffb90507be8d7f83143f9a',
    callbackURL : 'http://localhost:3000/auth/facebook/callback',
    profileFields : ['id','displayName','email']
    }, 
    function(token, refreshToken, profile,done){
        User.findOne({'facebookId': profile.id}, function(err,user){
            if (err) return done(error);
            if (user) {
                return done(null,user);
            } else {
                User.findOne({email : profile.emails[0].value}, function (err,user){
                    if (user){
                        user.facebookId = profile.idea
                        return user.save(function (err){
                            if (err) return done(null, false, {message : "Can't save user"});
                            return done(null,user);
                        })
                    }
                        var user = new User();
                        user.name = profile.displayName;
                        user.email = profile.emails[0].value;
                        user.facebookId = profile.id
                        user.save(function (err) {
                            if (err) return done(null, false, {message : "Can't save user info"});
                            return done(null,user);
                        });
            
                })
            }
        })
    }
));