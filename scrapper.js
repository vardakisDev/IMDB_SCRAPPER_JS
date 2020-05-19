const fetch = require("node-fetch");
const cheerio = require("cheerio");

const URL = "https://www.imdb.com/find?s=tt&ref_=fn_al_tt_mr&q=";
const movieURL = "https://www.imdb.com/title/";

const movieKeys = "/keywords?ref_=tt_stry_kw";

function searchMovies(searchTerm) {
  return fetch(`${URL}${searchTerm}`)
    .then((response) => response.text())

    .then((body) => {
      const movies = [];
      const $ = cheerio.load(body);
      $(".findResult").each(function (i, elem) {
        const $element = $(elem);

        const $image = $element.find("td a img");
        const $title = $element.find("td.result_text a");
        const imdbID = $title.attr("href").match(/title\/(.*)\//)[1];
        // console.log($image.attr("src"));

        const movie = {
          image: $image.attr("src"),
          title: $title.text(),
          imdbID: imdbID,
        };
        movies.push(movie);
      });
      return movies;
    });
}

async function GetKeywords(imdbID) {
  return fetch(`${movieURL}${imdbID}${movieKeys}`)
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      const keywords = [];
      $("table > tbody > tr > td.soda.sodavote > div.sodatext > a").each((index, element) => {
        keywords.push($(element).text());

      });

      return keywords;
    });
}

function GetMovie(imdbID) {
  return fetch(`${URL}${imdbID}`)
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      const $title = $(".title_wrapper h1");
      const title = $title
        .first()
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim();
      const runTime = $("time").contents().first().text().trim();
      //imdb rating
      const rating = $(".subtext").contents().first().text().trim();
      const reviewRatingIMDB = $("div.imdbRating > div.ratingValue > strong > span").text().trim();
      const ratingCountIMDB = $("div.imdbRating > a > span").text().trim();
      //metacritic score
      const ratingMeta = $("div.titleReviewBar > div:nth-child(1) > a > div > span").text().trim();
      //genres 
      const gernes = [];
      $("#titleStoryLine > div:nth-child(10) > a").map(function (i, el) {
        gerne = $(this).text().trim();
        gernes.push(gerne);

      });


      const poster = $("div.poster a img").attr("src");
      const summary = $("div.summary_text").text().trim();

      const keywords = GetKeywords(imdbID);

      const movie = {
        title,
        rating,
        reviewRatingIMDB,
        ratingCountIMDB,
        ratingMeta,

        runTime,
        gernes,
        summary,
        poster,
        keywords
      };
      return movie;
    });
}

module.exports = {
  searchMovies,
  GetMovie,
  GetKeywords,
};