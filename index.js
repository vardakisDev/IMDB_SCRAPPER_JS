const express = require("express");

const scrapper = require("./scrapper.js");
const app = express();

const port = process.env.PORT || 3000;


app.get("/", (req, res) => {
  res.json({
    message: "Scrapping is fun",
  });
});

app.get("/search/:title", (req, res) => {
  scrapper.searchMovies(req.params.title).then((movies) => {
    res.json(movies);
  });
});
app.get("/keywords/:imdbID", (req, res) => {
  scrapper.GetKeywords(req.params.imdbID).then((keywords) => {
    res.json(keywords);
  });

});


app.get("/movie/:imdbID", (req, res) => {
  scrapper.GetMovie(req.params.imdbID).then((movie) => {
    res.json(movie);
  });
});


app.listen(port, () => {
  console.log(`Listening on ${port}`);
});