//initializations
var express = require("express")
var mysql=require('mysql')
var bodyparser = require("body-parser")
const path = require("path")
const { table, count } = require("console")
var app = express()
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
currentactive=0;
//database connection establishment
var db= mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'',
    database:'bidding'
});
db.connect(function(err){
    if(err)
        throw err;
    console.log("connected to the database")
});

//landing page
app.get('/', function (req, res) {
    res.redirect('/login')
}
);



//landing form render page
app.get('/login', function (req, res) {
    res.render("loginpage.ejs", { message: "" })
});


//login page
app.post('/login', function (req, res) {
    uname = req.body.uname
    password = req.body.password
    flag=0
    sql= "select userid,password from user where userid= ?"
    db.query(sql,uname,function(err, result){
        if(err)
        {
            console.log(err)
        }
        else{
                console.log(result)
                result.forEach(function(user){
                    if(user.userid==uname && user.password==password)
                        {
                            flag=1;
                            res.redirect("/"+uname)
                            console.log(user.userid+" logged in")
                            currentactive++;
                        }
                })
                if(flag==0)
                    res.render("loginpage.ejs",{message:"wrong user name or password"})
            }
    });
});


//signup page
app.get('/login/newuser/:mes', function (req, res) {
    mes = req.params.mes
    res.render('signup.ejs', { mes: mes })
});
app.post('/login/newuser', function (req, res) {
    newuser={ 
        userid: req.body.uname,
        name:req.body.name,
        password: req.body.password,
        dob:req.body.dob,
        address:req.body.address,
        phone:req.body.phone,
        emailid: req.body.emailid
    }
    sql="insert into user set ?"
    db.query(sql,newuser,function(err, result){
        if(err)
        {
            console.log(err)
            res.redirect('/login/newuser/true')
        }
    else{
        console.log(result)
        res.redirect('/login')
    }
    });
});





//user"s home page
app.get('/:user', function (req, res) {
    var user = req.params.user
    res.render("userhome.ejs", { user: user })
});



//user's inventory
app.get('/:user/inventory', function (req, res) {
    user=req.params.user
    sql="select * from item where userid=?"
    db.query(sql,user,function(err,results){
        if(err)
            console.log(err)
        else{
            console.log(results)
            res.render("inventory.ejs",{items:results,user:req.params.user})
        }

    })
});
app.get('/:user/inventory/new', function(req,res){
    res.render("newitemform.ejs",{user:req.params.user})

});
app.post('/:user/inventory',function(req,res){
    user=req.params.user 
    console.log(req.body.item_name)
    item={
         itemid:user+Date.now().toString(),
         userid:user,
         item_name:req.body.item_name,
         description:req.body.description,
         type:req.body.type,
         base_value: req.body.base_value
     }
     sql="insert into item set ?"
     db.query(sql,item,function(err, result){
         if(err)
            console.log(err)
        else{
            console.log(result)
            res.redirect("/"+user+"/inventory")
        }
     })

})


//items detail page
app.get('/:user/inventory/:itemid', function (req, res) {
    var itemid=req.params.itemid
    var user=req.params.user
    sql="select * from item where  itemid=?"
    db.query(sql,itemid,function(err,result){
        if(err)
        console.log(err)
        else{
            console.log(result)
            item= result[0]
            console.log(item)
            res.render("item.ejs",{item: item,user: user})
        }
    })
});

//item eidt form submission:
app.post("/:user/inventory/:itemid/edit",function(req,res){
    var  itemid=req.params.itemid
    
    item_name =req.body.item_name,
    description=req.body.description,
    type=req.body.type,
    base_value= req.body.base_value
    user=req.params.user
    variables=[item_name,description,type,base_value,user,itemid]
    sql=" update item set item_name=?,description=?,type=?,base_value=? where userid=? and itemid=? "

    db.query(sql,variables,function(err,result){
        if(err)
            console.log(err)
        else{
            res.redirect("/"+user+"/inventory")
        }
    })

    
});

//purcchase section
app.get('/:user/purchase',function(req,res){
    user=req.params.user
    sql="select * from item where userid !=?"
    db.query(sql,user,function(err,results){
        if(err)
            console.log(err)
        else{
            console.log(results)
            res.render("purchase.ejs",{list:results,user:user})//bids object add krna
        }

    })
})
app.post('/:user/purchase/newbid/:itemid',function(req,res){
    user=req.params.user
    
})

app.listen(3000, function () {
    console.log("server started")
});