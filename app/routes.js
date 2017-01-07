﻿var User = require('../app/models/user');
var Party = require('../app/models/party');
var Admin = require('../app/models/admins');
var Category = require("../app/models/category")
var multer = require('multer');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path'); 
var crypto = require('crypto');
var mime = require('mime');

module.exports = function (app, passport) {

    app.use(function(req, res, next) {
      res.locals.user = req.user;
      next();
    });

    //for home page
    app.get("/", function (req, res) {
        res.render('frontend/index');
    });

    app.post("/api/parties", function (req, res) {
        Party.find({}, function (err, _parties) {
            res.json(_parties);
        });
    });

    app.get("/signin", function (req, res) {
        res.render('frontend/signin');
    });

    app.post('/signin', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true
    }));

    app.get("/signup", function (req, res) {
        res.render('frontend/signup', { message: req.flash('signupMessage') });
    });

    app.get("/signout", function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get("/parties/create", function (req, res) {
        res.render('frontend/parties/create', {
            party: {}
        });
    });

    var partyImagesStorage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/uploads/parties/images/')
      },
      filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
          cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        });
      }
    });

    var partyImagesUpload = multer({ storage: partyImagesStorage })

    app.post("/parties/create", partyImagesUpload.any(), function (req, res) {
        var party = new Party();
        party.user_id = req.user.id;
        party.title = req.body.title;
        party.description = req.body.description;
        party.price = req.body.price;
        party.location = req.body.location;
        party.latitude = req.body.latitude;
        party.longitude = req.body.longitude;
        party.images = req.files;
        party.contact_no = req.body.contact_no;
        party.email = req.body.email;
        party.website = req.body.website;
        party.video_url = req.body.video_url;
        party.facebook_url = req.body.facebook_url;
        party.twitter_url = req.body.twitter_url;
        party.youtube_url = req.body.youtube_url;
        party.pinterest_url = req.body.pinterest_url;
        party.save(function (err) {
            if (!err)
                res.redirect('/parties');
            else
                throw err;
        });
    })

    app.get("/parties", function (req, res) {
        Party.find({user_id: req.user.id}, function (err, _parties) {
            res.render('frontend/parties/index', {
                parties: _parties
            });
        });
    });

    app.get("/parties/:id/edit", function (req, res) {
        Party.findOne({ user_id: req.user.id, _id: req.params.id }, function (err, _party) {
            res.render('frontend/parties/create', {
                party: _party
            });
        });
    })

    app.post("/parties/:id/edit", partyImagesUpload.any(), function (req, res) {
        Party.findOne({ user_id: req.user.id, _id: req.params.id }, function (err, party) {
            party.user_id = req.user.id;
            party.title = req.body.title;
            party.description = req.body.description;
            party.price = req.body.price;
            party.location = req.body.location;
            party.latitude = req.body.latitude;
            party.longitude = req.body.longitude;
            party.images = req.files;
            party.contact_no = req.body.contact_no;
            party.email = req.body.email;
            party.website = req.body.website;
            party.video_url = req.body.video_url;
            party.facebook_url = req.body.facebook_url;
            party.twitter_url = req.body.twitter_url;
            party.youtube_url = req.body.youtube_url;
            party.pinterest_url = req.body.pinterest_url;
            party.save();
            res.redirect('/parties');               
        });
    })

    app.get("/parties/:id/delete", function (req, res) {
        Party.findOne({ user_id: req.user.id, _id: req.params.id }, function (err, _party) {
            if (_party != null) {
                Party.remove({ _id: req.params.id }, function (err, done) {
                    res.redirect('/parties');
                });
            }
        });
    })

    app.get("/parties/:id", function (req, res) {
        Party.findOne({ _id: req.params.id }, function (err, _party) {
            res.render('frontend/parties/show', {
                party: _party
            });
        });
    })

    //ADMIN

    app.addImage = function (image, callback) {
        Party.create(image, callback);
    }

    var _storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'Uploads/admin/Party/background/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })

    app.use(function (req, res, next) {
        res.locals.user = req.user;
        next();
    });

    var _logo_storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'Uploads/admin/Party/logo/');
        },
        logofilename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })

    var upload = multer({
        storage: _storage
    })

    var logoupload = multer({
        storage: _logo_storage
    })

    app.get("/admin/", function (req, res) {
        res.render('admin/login.ejs', { message: req.flash('loginMessage') });
    });

    app.get("/admin/login", function (req, res) {
        res.render('admin/login.ejs', { message: req.flash('loginMessage') });
    });

    app.get("/admin/ManageParties", function (req, res) {        
        Party.find({}, function (err, _parties) {
            res.render('admin/ManageParties', {
                _p: _parties
            });
        })
    });

    app.get("/admin/editPartyInfo/:id", function (req, res) {
        Party.findOne({ _id: req.params.id }, function (err, _parties) {
            res.render('admin/EditParties', {
                _p: _parties
            });
        });
    })

    app.get("/admin/deletePartyInfo/:id", function (req, res) {
        Party.findOne({ _id: req.params.id }, function (err, _parties) {
            if (_parties != null) {
                Party.remove({ _id: req.params.id }, function (err, done) {
                    res.redirect('/admin/ManageParties');
                });
            }
        });
    })

    app.post("/admin/EditPartyEvent", upload.any(), function (req, res) {
        Party.findOne({ _id: req.body.id }, function (err, _parties) {
            if (req.files.length > 0) {
                
            }                      
            _parties.title = req.body.title;
            _parties.location = req.body.location;
            //_parties.endtime = req.body.endtime;
            //_parties.starttime = req.body.starttime;
            _parties.duration = req.body.duration;
            _parties.enddate = req.body.enddate;
            _parties.startdate = req.body.startdate;
            _parties.description = req.body.description;
            _parties.contact_no = req.body.contact_no ;
            _parties.email = req.body.email;
            _parties.website = req.body.website;
            _parties.video_url = req.body.video_url;
            _parties.facebook_url = req.body.facebook_url;
            _parties.twitter_url = req.body.twitter_url;
            _parties.youtube_url = req.body.youtube_url;
            _parties.pinterest_url = req.body.pinterest_url;
            _parties.images = [];
            _parties.latitude = req.body.latitude;
            _parties.longitude = req.body.longitude;            
            _parties.price = req.body.price;            
            _parties.save();
            res.redirect('/admin/ManageParties');
        });
    })

    app.get("/admin/AddNewParty", function (req, res) {
        res.render('admin/AddNewParty.ejs');
    });

    app.post("/admin/addNewEvent", upload.any(), function (req, res) {
        var backgroundImagePaths = req.files[0].path;
        var partylogopaths = req.files[1].path
        var partySchema = new Party();
        partySchema.title = req.body.title
        partySchema.description = req.body.description;
        partySchema.backgroundImagePath = backgroundImagePaths;
        partySchema.startdate = req.body.startdate;
        partySchema.enddate = req.body.enddate;
        partySchema.starttime = req.body.starttime;
        partySchema.endtime = req.body.endtime;
        partySchema.partylogopath = partylogopaths;
        partySchema.location = req.body.location;
        partySchema.save(function (err) {
            if (!err)
                res.redirect('/admin/ManageParties');
            else
                throw err;
        });
    })

    app.get("/admin/signup", function (req, res) {
        res.render('admin/signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get("/admin/profile", isLoggedIn, function (req, res) {
        res.render('admin/profile.ejs', {
            user: req.user
        });
    });

    app.get("/admin/userhome", isLoggedIn, function (req, res) {
        res.render('admin/userhome.ejs', {
            user: req.user
        });
    });

    app.get("/admin/logout", function (req, res) {
        req.logout();
        res.redirect('/admin/');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/admin/');
    }

    app.post('/admin/signup', passport.authenticate('local-signup', {
        successRedirect: 'userhome',
        failureRedirect: 'signup',
        failureFlash: true
    }));

    //for login
    app.post('/admin/login', passport.authenticate('local-login', {
        successRedirect: 'userhome',
        failureRedirect: 'login',
        failureFlash: true,
    }));
    
    //---------------------------------------------------------------------------------------------------User routes--------------------------------------------------------------
    app.get("/admin/ManageUsers", function (req, res) {
        User.find({}, function (err, _ausers) {
            res.render('admin/ManageUsers', {
                _u: _ausers
            });
        })
    });

    app.get("/admin/AddNewUser", function (req, res) {
        res.render('admin/AddNewUser.ejs');
    });

    app.post("/admin/addNewuser", upload.any(), function (req, res, done) {
        var profileimage = "";
        if (req.files.length > 0 && req.files[0].path != null) {
            profileimage = req.files[0].path;
        } else {
            profileimage = "";
        }
        User.findOne({ 'local.email': req.body.email }, function (err, user) {
            if (err)
                return done(err);
            if (user != null) {
                return done(null, false, req.flash('EmailMessage', 'Email is already taken!'));
            }
            else {
                var userSchema = new User();
                userSchema.local.name = req.body.name
                userSchema.local.username = req.body.username;
                userSchema.local.password = userSchema.generateHash(req.body.password);
                userSchema.local.profileimage = profileimage;
                userSchema.local.email = req.body.email;
                userSchema.save(function (err) {
                    if (!err)
                        res.redirect('/admin/ManageUsers');
                    else
                        throw err;
                });
            }
        });
    });

    app.get("/admin/EditUserInfo/:id", function (req, res) {
        User.findOne({ _id: req.params.id }, function (err, _ausers) {
            res.render('admin/EditUsers', {
                _au: _ausers
            });
        });
    });

    app.get("/admin/DeleteUserInfo/:id", function (req, res) {
        User.findOne({ _id: req.params.id }, function (err, _ausers) {
            if (_ausers != null) {
                User.remove({ _id: req.params.id }, function (err, done) {
                    res.redirect('/admin/ManageUsers');
                });
            }
        });
    });

    app.post("/admin/EditUserDetails", upload.any(), function (req, res) {
        User.findOne({ _id: req.body.id }, function (err, _ausers) {
            if (req.files.length > 0) {
                var profileimage = req.files[0].path;
            }
            if (_ausers != null) {
                if (_ausers.local.profileimage == null) {
                    _ausers.local.profileimage = "";
                } else {
                    _ausers.local.profileimage = profileimage;
                }
            }
            _ausers.local.name = req.body.name;
            _ausers.local.username = req.body.username;
            _ausers.save();
            res.redirect('/admin/ManageUsers');
        });
    });

    //--------------------------------------------------------------------------------Manage Admin Users----------------------------------------------------------------
    //ManageAdminUsers
    app.get("/admin/ManageAdminUsers", function (req, res) {
        Admin.find({}, function (err, _admin_ausers) {
            res.render('admin/ManageAdminUsers', {
                _au: _admin_ausers
            });
        })
    });

    app.get("/admin/AddNewAdmin", function (req, res) {
        res.render('admin/AddAdminUsers.ejs');
    });

    app.get("/admin/EditAdminUserInfo/:id", function (req, res) {
        Admin.findOne({ _id: req.params.id }, function (err, _admin_ausers) {
            res.render('admin/EditAdminUsers', {
                _au: _admin_ausers
            });
        });
    });

    app.get("/admin/DeleteAdminUserInfo/:id", function (req, res) {
        Admin.findOne({ _id: req.params.id }, function (err, _admin_ausers) {
            if (_admin_ausers != null) {
                Admin.remove({ _id: req.params.id }, function (err, done) {
                    res.redirect('/admin/ManageAdminUsers');
                });
            }
        });
    });

    app.post("/admin/addNewAdminuser", upload.any(), function (req, res, done) {
        var profileimage = "";
        if (req.files.length > 0 && req.files[0].path != null) {
            profileimage = req.files[0].path;
        } else {
            profileimage = "";
        }
        Admin.findOne({ 'local.email': req.body.email }, function (err, admin_auser) {
            if (err)
                return done(err);
            if (admin_auser != null) {
                return done(null, false, req.flash('EmailMessage', 'Email is already taken!'));
            }
            else {
                var adminSchema = new Admin();
                adminSchema.local.name = req.body.name;
                adminSchema.local.username = req.body.username;
                adminSchema.local.password = adminSchema.generateHash(req.body.password);
                adminSchema.local.profileimage = profileimage;
                adminSchema.local.email = req.body.email;
                adminSchema.save(function (err) {
                    if (!err)
                        res.redirect('/admin/ManageAdminUsers');
                    else
                        throw err;
                });
            }
        });
    });

    app.post("/admin/EditAdminUserDetails", upload.any(), function (req, res) {
        Admin.findOne({ _id: req.body.id }, function (err, _admin_ausers) {
            if (req.files.length > 0) {
                var profileimage = req.files[0].path;
            }
            if (_admin_ausers != null) {
                if (_admin_ausers.local.profileimage == null) {
                    _admin_ausers.local.profileimage = "";
                } else {
                    _admin_ausers.local.profileimage = profileimage;
                }
            }
            _admin_ausers.local.name = req.body.name;
            _admin_ausers.local.username = req.body.username;
            _admin_ausers.save();
            res.redirect('/admin/ManageAdminUsers');
        });
    });
    //----------------------------------------User profile----------------------------------------------------------
    app.get("/admin/EditProfileDetails", function (req, res) {
        Admin.findOne({ _id: req.user._id }, function (err, _admin_ausers) {
            res.render('admin/EditProfile', {
                _au: _admin_ausers
            });
        });
    });
    app.post("/admin/EditProfileInfo", upload.any(), function (req, res) {
        Admin.findOne({ _id: req.body.id }, function (err, _admin_ausers) {
            if (req.files.length > 0) {
                var profileimage = req.files[0].path;
            }
            if (_admin_ausers != null) {
                if (_admin_ausers.local.profileimage == null) {
                    _admin_ausers.local.profileimage = "";
                } else {
                    _admin_ausers.local.profileimage = profileimage;
                }
            }
            _admin_ausers.local.name = req.body.name;
            _admin_ausers.local.username = req.body.username;
            _admin_ausers.save();
            res.redirect('/admin/userhome');
        });
    });
    //-------------------------------------Change password---------------------------------------------------------
    app.get("/admin/ChangePasswordLayout", function (req, res) {
        res.render('admin/ChangePassword.ejs');
    });
    app.post("/admin/ChangePasswordInfo", upload.any(), function (req, res) {
        var adminSchema = new Admin();
        Admin.findOne({ _id: req.user._id }, function (err, _admin_ausers) {
            _admin_ausers.local.password = adminSchema.generateHash(req.body.password);
            _admin_ausers.save();
            res.redirect('/admin/userhome');
        });
    });   

    //----------------------------Categories Routes--------------------------------------------------------------

    app.get("/admin/CategoriesLayout", function (req, res) {
        Category.find({}, function (err, _categories) {
            res.render('admin/ManageCategories', {
                _c: _categories
            });
        })
    });
    app.get("/admin/AddNewCategory", function (req, res) {
        res.render('admin/AddNewCategory.ejs');
    });
    app.post("/admin/addnewcategory", upload.any(), function (req, res) {
        var CategorySchema = new Category();
        CategorySchema.categoryname = req.body.categoryname;
        CategorySchema.save(function (err) {
            if (!err)
                res.redirect('/admin/CategoriesLayout');
            else
                throw err;
        });
    });
    app.get("/admin/EditCategoryInfo/:id", function (req, res) {
        Category.findOne({ _id: req.params.id }, function (err, _category) {
            res.render('admin/EditCategories', {
                _c: _category
            });
        });
    })
    app.get("/admin/DeleteCategoryInfo/:id", function (req, res) {
        Category.findOne({ _id: req.params.id }, function (err, _category) {
            if (_category != null) {
                Category.remove({ _id: req.params.id }, function (err, done) {
                    res.redirect('/admin/CategoriesLayout');
                });
            }
        });
    });
    app.post("/admin/EditCategories", upload.any(), function (req, res) {
        Category.findOne({ _id: req.body.id }, function (err, _category) {            
            _category.categoryname = req.body.categoryname;            
            _category.save();
            res.redirect('/admin/CategoriesLayout');
        });
    });
}
