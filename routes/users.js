"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("users")
      .then((results) => {
        res.json(results);
    });
  });

  // Endpoint for getting the create-new-poll page
  router.get("/polls/new", (req, res) => {

  });

  // Endpoint for admin access of poll
  router.get("/polls/:id/admin", (req, res) => {

  });

  // Endpoint for creating a poll. Redir to polls/:id/admin if success
  router.post("/polls", (req, res) => {

    res.redirect("/polls/:id/admin");
  });

  // Endpoint for getting the voting page
  router.get("/polls/:id", (req, res) => {

  });

  // Endpoint for submitting the vote. Redir to /polls/:id/votes on success
  router.post("/polls/:id", (req, res) => {

    res.redirect("/polls/:id/votes")
  });

  // Endpoint for displaying the current votes status
  router.get("/polls/:id/votes", (req, res) => {

  });

  // Endpoint for error page
  router.get("/error", (req, res) => {

  });


  return router;
}
