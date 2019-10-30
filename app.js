const express = require("express"),
	  app = express(),
	  ejs = require("ejs"),
	  bodyParser = require("body-parser"),
	  mongoose = require("mongoose"),
	  methodOverride = require("method-override"),
	  expressSanitizer = require("express-sanitizer");


//APP CONFIG
app.set("view engine", "ejs");
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(expressSanitizer()); //must come after app.use statement for bodyParser
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true ,useUnifiedTopology: true});

// MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({title: String,
									 image: String,
									 body: 	String,
									 created: {type: Date, default: Date.now}
});

const Blog = new mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES

// Blog.create({title: "Test Blog",
// 		     image: "https://images.unsplash.com/photo-1479065476818-424362c3a854?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
// 		     body: 	"This is only a test."
// });

//INDEX ROUTE
app.get("/", (req, res) =>{
	res.redirect("/blogs");
});

app.get("/blogs", (req, res) =>{
	Blog.find({}, (err, blogs) =>{
		if(err) {
			console.log(`Error: ${err}`);
		} else {
			res.render("index", {blogs});
		}
	});
	
});

//NEW ROUTE
app.get("/blogs/new", (req,res) =>{
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req,res) =>{
	req.body.blog.body = req.sanitize(req.body.blog.body);  // sanitize body
	Blog.create(req.body.blog, (err, newBlog) => {
		if(err){
			console.log(`Error: ${error}`);
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
	
});

//SHOW ROUTE
app.get("/blogs/:id", (req,res) => {
	Blog.findById(req.params.id, (err,foundBlog) => {
		if(err){
			console.log(`Error: ${err}`);
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if (err) {
			console.log(`Error: ${err}`);
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);  // sanitize body
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
			if (err){
				console.log(`Error: ${error}`);
				res.redirect("/blogs");
		    } else {
				res.redirect(`/blogs/${req.params.id}`);
			}
		   });
	
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err) => {
			if (err){
				console.log(`Error: ${error}`);
				res.redirect("/blogs");
		    } else {
				res.redirect("/blogs/");
			}
		   });
	
});




app.listen(3000, () => console.log("BLOG APP STARTED"));