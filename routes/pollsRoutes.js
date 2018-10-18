"use strict";

// Importing packages
const express = require('express');
const router  = express.Router();


// base 36 to include all 26 letters and 10 numbers
// returns a numberOfChars long string starting at index 2
function generateRandomString(numberOfChars) {
  return Math.random().toString(36).substr(2, numberOfChars);
}

module.exports = (knex) => {

  // Endpoint for getting the create-new-poll page
  router.get("/new", (req, res) => {
    req.session.email = 'sdgdfgfd';
    // req.session.email = req.body.email;

    res.render("../views/new_poll.ejs");
  });

  // Endpoint for creating a poll. Redir to polls/:id/votes if success
  // where :id is a randomly generated 8 char long string
  router.post("/new", (req, res) => {
    console.log(req);
    // creates an object that knex can insert
    // the keys are the column names in the poll table
    let uniqueURL = generateRandomString(8);
    let newPoll = { text: req.body.question,
      creator_email: req.body.email,
      date_created: new Date(),
      randomURL: uniqueURL,
      end_date: req.body.end };

      // by default this router expects to receive all the options
      // in a JSON.stringify string
      let receivedOptions = JSON.parse(req.body.options);

      // next we insert the new question as a new instance of the poll table
      // insertion returns the unique id of the new poll
      let pollID;
      knex.table('poll').insert(newPoll).returning('id').then(id => {
        pollID = id[0];
      }).then(function() {

        // using the received pollid we can parse an array of objects
        // which knex can insert into the response table
        return receivedOptions.map(element => {
          return {poll_id: pollID, text: element};
        });
      }).then((result) => {
        knex.table('response').insert(result).then(function(){
          req.session.email = req.body.email;
          res.redirect(`/polls/${uniqueURL}/votes`);
        })
      });
  });

  // This searches for and deletes a poll
  router.delete("/:id", (req, res) => {
    knex("poll")
      .select("*")
      .where("randomURL", req.params.id)
      .then(function(response) {
          if (req.session.email === response[0].creator_email) {
            knex("poll").where("randomURL", req.params.id).del().then(function(){
              console.log(req.params.id);
            });
          } else {
            res.redirect("/error")
          }
      });
  });

  // Endpoint for getting the voting page
  // Queries DB for randomURL and outputs data associated with the row
  router.get("/:id", (req, res) => {
    let templateVars = {};
    knex
      .select('*')
      .from('poll')
      .where('randomURL', req.params.id)
      .then(function(response) {
        templateVars.poll = response[0];
        res.render("../views/vote.ejs", templateVars);
      });
  });

  // Endpoint for submitting the vote. Redir to /polls/:id/votes on success
  // Logic is: find poll using randomURL; find responses using poll_id; find votes using
  //  response_id; loop through votes and responses and if reponse_id === id, increment
  router.put("/:id", (req, res) => {
    const templateVars = {};
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then(function(response) {
        templateVars.poll = response[0];
        knex
          .select('*')
          .from('response')
          .where('poll_id', req.params.id)
          .then(function(response) {
            templateVars.responses = response;
            templateVars.responses.forEach(ele => {
              knex
                .select('*')
                .from('votes')
                .where('response_id', ele.id)
                .then(function(response) {
                  templateVars[ele.id]votes = response;
                  for (const vote of templateVars[ele.id]votes) {
                    for (const response of templateVars.responses) {
                      if (response.id === vote.response_id) {
                        templateVars[response]borda += vote.bordaValue;
                      }
                    }
                  }
                });
            });
          })
          .then(function() {
            res.redirect("/:id/votes", templateVars);
          });
        });
  });

  // Submit email address to soft-login and assign cookie
  router.put("/:id/votes", (req, res) => {
    // req.session.email = req.body.email;
    // add cookie
    res.redirect(`/${req.params.id}/votes`);
  });

  // Endpoint for displaying the current votes status
  router.get("/:id/votes", (req, res) => {
    let templateVars = {};
    let pollId;

    // once the correct poll is identified it is passed into the variables object
    // the pollID variable is used to find the appropriate options for this poll
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then(function(response) {
        templateVars.poll = response[0];
        pollId = templateVars.poll.id;
      }).then(function() {
        // the options for this poll are added to the variables object
        knex
          .select('*')
          .from('response')
          .where('poll_id', pollId)
          .then(function(options) {
            templateVars.options = options;
            console.log(templateVars);
            // ejs uses the variables to render the page
            res.render("../views/vote_finished.ejs", templateVars);
          });
      });
  });

  // Searches for a poll based on randomURL and if owner, searches for specific
  //  response using id, then deletes
  router.delete("/:id/:response", (req, res) => {
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        if (req.session.email === response[0].creator_email) {
        knex('response')
          .where('poll_id', response[0].id)
          .andWhere('id', req.params.response)
          .del()
          .then(function(){
            console.log('attempting delete')
          });
        }
      });
  });

  // Update a single response: searches for poll using randomURL, then checks if
  //  owner, and if true, searches for response using id, and update the text
  router.put("/:id/:response", (req, res) => {
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        if (req.session.email === response[0].creator_email) {
        knex('response')
          .where('poll_id', response[0].id)
          .andWhere('id', req.params.response)
          .update({
            text: req.body.text
          })
          .then(function(){
            console.log('attempting update');
            res.redirect(`/polls/${req.params.id}/votes`);
          });
        }
      });
  })

  return router;
}
