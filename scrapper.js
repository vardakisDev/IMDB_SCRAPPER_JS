const fetch = require("node-fetch");
const cheerio = require("cheerio");
const request = require("request");

const URL = "https://www.imdb.com/find?s=tt&ref_=fn_al_tt_mr&q=";
const movieURL = "https://www.imdb.com/title/";

const movieKeys = "/keywords?ref_=tt_stry_kw";

async function searchMovies(searchTerm) {
  return await fetch(`${URL}${searchTerm}`)
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
  return await fetch(`${movieURL}${imdbID}${movieKeys}`)
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      const keywords = [];
      $("table > tbody > tr > ").each((index, element) => {
        let key = $(element)
          .find("td.soda.sodavote > div.sodatext > a")
          .text()
          .trim();
        let relevance = $(element)
          .find(" div.did-you-know-actions > div > a")
          .text()
          .trim();
        const keyword = {
          key: key,
          relevance: relevance,
        };
        keywords.push(keyword);
      });

      return keywords;
    });
}

async function GetMovie(imdbID) {
  return await fetch(`${URL}${imdbID}`)
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      //title
      const $title = $(".title_wrapper h1");
      const title = $title
        .first()
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim();
      //screentime and and year relased
      const yearRun = $(" div.subtext > a:nth-child(8)").text().trim();
      const runTime = $("time").contents().first().text().trim();
      //imdb rating
      const rating = $(".subtext").contents().first().text().trim();
      const reviewRatingIMDB = $(
          "div.imdbRating > div.ratingValue > strong > span"
        )
        .text()
        .trim();
      const ratingCountIMDB = $("div.imdbRating > a > span").text().trim();
      //metacritic score
      const ratingMeta = $(
          "div.titleReviewBar > div:nth-child(1) > a > div > span"
        )
        .text()
        .trim();
      //genres
      const gernes = [];
      $("#titleStoryLine > div:nth-child(10) > a").map(function (i, el) {
        gerne = $(this).text().trim();
        gernes.push(gerne);
      });
      //all the cast members
      const cast = [];
      $("#titleCast > table > tbody > tr> ").map(function (i, el) {
        let castmember = $(this).find("td:nth-child(2) a").text().trim();
        if (castmember != "") cast.push(castmember);
      });
      //poster might change it later
      const poster = $("div.poster a img").attr("src");
      //summary text
      const summary = $("div.summary_text").text().trim();
      //grab all the key words

      //more like this
      const similarIMDB = [];
      $("#title_recs > div.rec_overviews > div>").each((i, el) => {
        let title = $(el)
          .find(
            "div.rec_details > div > div.rec-jaw-upper > div.rec-title > a > b"
          )
          .text();
        let id = $(el)
          .find("div.rec_details > div > div.rec-jaw-upper > div.rec-title > a")
          .attr("href");
        if ((title != "") & (id != null)) {
          const movie = {
            title: title,
            imdbID: id.match(/title\/(.*)\//)[1],
          };
          similarIMDB.push(movie);
        }
      });
      const keywords = GetKeywords(imdbID).then(result => {
        console.log(result);
      });
      const movie = {
        title,
        yearRun,
        rating,
        reviewRatingIMDB,
        ratingCountIMDB,
        ratingMeta,
        runTime,
        gernes,
        summary,
        poster,
        keywords,
        cast,
        similarIMDB,
      };
      return movie;
    });
}

module.exports = {
  searchMovies,
  GetMovie,
  GetKeywords,
};