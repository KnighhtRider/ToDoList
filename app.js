const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const date = require(__dirname+"/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vivek:Test%40123@cluster0.ceyplo4.mongodb.net/todoListDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchemas = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchemas);


app.get("/", (req, res) => {

    Item.find({}, function(err, foundItems) {
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if(err) console.log(err);
                else console.log("Successfully saved default items to DB.");
            }); 
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems});
        }
    });    

});

app.post("/", (req, res) => {

    const itemName =  req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");        
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();

            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
        
        if(!err) {
            console.log("Successfully deleted checked item.");
            res.redirect("/");
        }
    });
   } else {
       List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
           if(!err) {
               res.redirect("/" + listName);
           }
       });
   }

});

app.get("/:customListName", function(req, res) { 
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if(!err) {
            if(!foundList) {
                /* Create a new list */
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                /* show an existing list*/

                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
                
            }
        }
    });
});

app.get("/about", (req, res) => {
    res.render("about");
});


app.listen(3000, () => {
    console.log("Server Started on port 3000.");
});