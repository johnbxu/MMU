"use strict";

// Importing packages
const express = require('express');
const router  = express.Router();

// Mailgun
const api_key = '15ee2e12e8149b90d5ef7787213e7e15-a3d67641-89656c39';
const DOMAIN = 'sandbox419377d991934b54ac091534aad574dd.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

// base 36 to include all 26 letters and 10 numbers
// returns a numberOfChars long string starting at index 2
function generateRandomString(numberOfChars) {
  return Math.random().toString(36).substr(2, numberOfChars);
}

module.exports = (knex) => {
  const computeBorda = () => {
    const sum = {};
    knex('poll')
      .join('response', 'poll.id','=', 'response.poll_id')
      .join('vote', 'vote.response_id', '=', 'response.id')
      .select('*')
      .where('poll.randomURL', req.params.id)
      .then(function(table) {
        table.forEach(vote => {
          if (!sum[vote.response_id]) {
            sum[vote.response_id] = 0;
          }
          sum[vote.response_id] += vote.bordaValue;
        });
        for (let id in sum) {
          knex('response')
            .where('id', Number(id))
            .update('borda', sum[id])
            .then(function(){
              console.log('updated');
            })
        }
      });
  }

  // Endpoint for getting the create-new-poll page
  router.get("/new", (req, res) => {
    res.render("../views/new_poll.ejs");
  });

  // Endpoint for creating a poll. Redir to polls/:id/votes if success
  // where :id is a randomly generated 8 char long string

  router.post("/new", (req, res) => {
    // creates an object that knex can insert
    // the keys are the column names in the poll table

    let receivedData = req.body;

    const uniqueURL = generateRandomString(8);
    const newPoll = { text: receivedData.question,
      creator_email: receivedData.email,
      date_created: new Date(),
      randomURL: uniqueURL,
      end_date: receivedData.end};

      // by default this router expects to receive all the options
      // in a JSON.stringify string
      let receivedOptions = receivedData.options;

      // next we insert the new question as a new instance of the poll table
      // insertion returns the unique id of the new poll
      let pollID;
      knex.table('poll').insert(newPoll).returning('id').then(id => {
        pollID = id[0];
      }).then(function() {

        // using the received pollid we can parse an array of objects
        // which knex can insert into the response table
        return receivedOptions.map(element => {
          return {poll_id: pollID, response_text: element, borda: 0};
        });
      }).then((result) => {
        knex.table('response').insert(result).then(function(){
          req.session.email = receivedData.email;
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
              console.log('deleted');
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
    const options = req.body.obj;
    const borda = {};
    for (let i = 0; i < options.length; i++) {
      knex('response')
        .where('id', options[i])
        .update({
          borda: options.length - i
        })
        .then(function() {
          console.log('updated borda')
        });
      // borda[options[i]] = options.length - i;
    };
    // console.log(borda);
    // knex('poll')
    //   .join('response', 'poll.id','=', 'response.poll_id')
    //   .where('poll.randomURL', req.params.id)
    //   .update({
    //
    //   })
    //   .then(function(table) {
    //     console.log(table);
    //     templateVars.responses = table;
    //     res.render("../views/vote_finished.ejs", templateVars);
    //   });
    computeBorda();
  });


  // Endpoint for displaying the current votes status
  router.get("/:id/votes", (req, res) => {
    let templateVars = {};
    let pollId;

    knex('poll')
      .join('response', 'poll.id','=', 'response.poll_id')
      .select('*')
      .where('poll.randomURL', req.params.id)
      .then(function(table) {
        templateVars.responses = table;
        res.render("../views/vote_finished.ejs", templateVars);
      });
    // once the correct poll is identified it is passed into the variables object
    // the pollID variable is used to find the appropriate options for this poll
    // knex
    //   .select('*')
    //   .from('poll')
    //   .where('poll.randomURL', req.params.id)
    //   .then(function(response) {
    //     templateVars.poll = response[0];
    //     pollId = templateVars.poll.id;
    //   }).then(function() {
    //     // the options for this poll are added to the variables object
    //     knex
    //       .select('*')
    //       .from('response')
    //       .where('poll_id', pollId)
    //       .then(function(options) {
    //         templateVars.options = options;
    //         console.log(templateVars);
    //         console.log(options);
    //         // ejs uses the variables to render the page
    //         res.render("../views/vote_finished.ejs", templateVars);
    //       });
    //   });
  });

  // Submit email address to soft-login and assign cookie
  router.put("/:id/votes", (req, res) => {
    // req.session.email = req.body.email;
    // add cookie
    res.redirect(`/${req.params.id}/votes`);
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

  router.post("/test/email", (req, res) => {
    const data = {
      from: 'Excited User <me@samples.mailgun.org>',
      // to:
      subject: 'Hello',
      text: 'Testing some Mailgun awesomness!'
    };
    mailgun.messages().send(data, function (error, body) {
      console.log('emailed');
    });

  })
  return router;
}
