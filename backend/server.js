const express = require("express");
const path = require("path");
const {
  getDemoUser,
  createListing,
  getListings,
  getListing,
  requestExchange,
  getProfile,
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Where to find the frontend (HTML pages and CSS)
const frontendDir = path.join(__dirname, "..", "frontend");
app.set("view engine", "ejs");
app.set("views", path.join(frontendDir, "pages"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/css", express.static(path.join(frontendDir, "css")));

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// Browse
app.get("/browse", (req, res) => {
  const listings = getListings(true);
  res.render("browse", { listings });
});

// Post form
app.get("/post", (req, res) => {
  res.render("post", { query: req.query });
});

app.post("/post", (req, res) => {
  const user = getDemoUser();
  const title = (req.body.title || "").trim();
  if (!title) {
    return res.redirect("/post?error=Title+is+required");
  }
  createListing(user.id, title, req.body.description?.trim(), req.body.category?.trim());
  res.redirect("/browse");
});

// Profile
app.get("/profile", (req, res) => {
  const user = getDemoUser();
  const { user: fullUser, listings } = getProfile(user.id);
  const commitmentEnd = fullUser.commitment_end ? new Date(fullUser.commitment_end * 1000) : null;
  const active = commitmentEnd && commitmentEnd.getTime() > Date.now();
  res.render("profile", {
    user: fullUser,
    listings,
    commitmentEnd,
    active,
  });
});

// Listing detail
app.get("/listing/:id", (req, res) => {
  const listing = getListing(req.params.id);
  if (!listing || !listing.is_active) {
    return res.status(404).send("Not found");
  }
  res.render("listing", { listing, query: req.query });
});

app.post("/request", (req, res) => {
  const user = getDemoUser();
  const result = requestExchange(user.id, req.body.listingId);
  if (result.error) {
    return res.redirect("/listing/" + req.body.listingId + "?error=" + encodeURIComponent(result.error));
  }
  res.redirect("/listing/" + req.body.listingId + "?success=Request+sent");
});

app.listen(PORT, () => {
  console.log("Toss running at http://localhost:" + PORT);
});
