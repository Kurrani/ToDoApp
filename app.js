//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

 // const items = ["Buy Food", "Cook Food", "Eat Food"];
 // const workItems = [];
// This version of connection is used when we are running database on the
// terminal at the same time app.js is runned
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// This version is when we use MongoDB Cluster to connect our database
// Without having to runn our database on the terminal
mongoose.connect("mongodb+srv://admin-andy:Test123@cluster0.3bhuikh.mongodb.net/todolistDB", {useNewUrlParser: true});
//
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to Your todo List"
});

const item2 = new Item({
  name: "Hit the + buttom to add stuff."
});
const item3 = new Item({
  name: "<--- Hit the delete on items"
});

const defaultItems = [item1, item2, item3];

// Creating a new Schema that has a list of schemas
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully Added to the Data Base");
//   }
// });

app.get("/", function(req, res) {


// Look for anything in the Item Data base
  Item.find({}, function(err, foundItems){
    // Only add the default if list is empty.
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully Added to the Data Base");
        }
      });
      // come back to this to avoid the if statement.
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });


});

// Creating a Dynamic website using custom name
app.get("/:customListName", function(req, res){

//  console.log(req.params.customListName);
// Creating a varaible with what custonName is entered
// Using Lodash to capitalize the first letter of the listName
 const customListName = _.capitalize(req.params.customListName);

 List.findOne({name: customListName}, function(err, foundList){
   if(!err){
     if(!foundList){
       // console.log("Does not Exist");

       const list = new List({
         name: customListName,
         items: defaultItems
       });
       list.save();
       res.redirect("/"+ customListName);
     }else{
       res.render("list", {listTitle:foundList.name, newListItems: foundList.items})
     }
   }
 });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  // check where to add new item. from either thr root or other places
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully Removed item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});



app.get("/about", function(req, res){
  res.render("about");
});

// Using Heroku this is the right way
let port = process.env.PORT;
if(port === null || port === ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
