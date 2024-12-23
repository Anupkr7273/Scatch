const userModel = require('../models/user-model');
const bcrypt=require("bcrypt");
const{generateToken}= require("../utils/generateToken")
const productModel = require('../models/product-model');

module.exports.registerUser= async function(req,res){
    try{
        let {email,password,fullname}=req.body;

    let user=await userModel.findOne({email:email});
    if(user) return res.status(401).send("You already have an account, please login.");
    
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(password,salt,async function(err,hash){
            if(err) return res.send(err.message);
            else {
                let user= await userModel.create({
        email,
        password:hash,
        fullname
    });
    let token=generateToken(user);
    res.cookie("token",token);
    
    res.send("user created successfully");
            }
        })
    })
    }
    catch(err){
        res.send(err.message);
        
    }
};

module.exports.loginUser=async function(req,res){
    let {email,password}=req.body;

    let user=await userModel.findOne({email:email});
    if(!user) return res.send("Email or Password incorrect")

    bcrypt.compare(password,user.password,async function(err,result){
        if(result){
            let token=generateToken(user);
            res.cookie("token",token);
            const products = await productModel.find(); 
            res.render('shop', { products });
        }
        else return res.send("Email or Password incorrect")
    });
};
module.exports.logoutUser=(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Logout failed.');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/'); 
    });
};