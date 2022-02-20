// server.js
const { createServer } = require("http")
const { parse } = require("url")
const express = require("express")
const app = express()
const next = require("next")
const dev = process.env.NODE_ENV !== "production"
const _app = next({ dev })
const handle = _app.getRequestHandler()
const port = process.env.PORT || 8000
const path = require("path")
// const expressValidator = require("express-validator")
const bodyParser = require("body-parser")
// const axios = require("axios")
const unirest = require("unirest")
app.use(bodyParser.json())

_app
  .prepare()
  .then(() => {
    //  app.use(expressValidator())

    app.post("/get-financials", async (req, res) => {
      try {
        const { symbol } = req.body
        var req = unirest(
          "GET",
          "https://rapidapi.p.rapidapi.com/stock/v2/get-financials"
        )

        req.query({
          symbol,
          region: "US",
        })

        req.headers({
          "x-rapidapi-key":
            "16NpRXta7AmshFb8mMe5ejmPTAldp1TYLfmjsnxdolADtBFBUJ",
          "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
          useQueryString: true,
        })

        req.end(function (_res) {
          if (_res.error) res.json(_res.error)
          res.json(_res.body)
        })
        //   res.send("success")
      } catch (err) {
        console.log("err", err)
        res.send(err)
      }

      // res.json({ success: true })
    })
    app.use(handle).listen(3000)
    app.get("*", (req, res) => {
      return handle(req, res)
    })
    app.listen(port, err => {
      if (err) throw err
      console.log("> Ready on http://localhost:3000")
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })
